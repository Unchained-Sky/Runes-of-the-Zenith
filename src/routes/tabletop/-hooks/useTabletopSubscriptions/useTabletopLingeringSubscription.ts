import useMountEffect from '~/hooks/useMountEffect'
import { type Tables } from '~/supabase/databaseTypes'
import { useSupabase } from '~/supabase/useSupabase'
import { type TabletopGMEnemyData } from '../../$campaignId.gm/-hooks/tabletopData/useGMTabletopEnemies'
import { lingeringDataFormatter } from '../../-utils/lingeringData'
import { useTabletopContext } from '../../-utils/TabletopContext'
import useCharacterLookup from '../../-utils/useCharacterLookup'
import { type TabletopHeroData } from '../tabletopData/useTabletopHeroes'
import { LOG_SUBSCRIPTION_PAYLOADS } from './useTabletopSubscriptions'

export default function useTabletopLingeringSubscription() {
	const { supabase } = useSupabase()
	const { queryClient, campaignId, role } = useTabletopContext()

	const characterLookup = useCharacterLookup()

	useMountEffect(() => {
		const channelName = `tabletop_lingering:${campaignId}`
		supabase
			.channel(channelName)
			.on('postgres_changes', {
				event: '*',
				schema: 'public',
				table: 'tabletop_lingering'
			}, payload => {
				if (LOG_SUBSCRIPTION_PAYLOADS) console.log(payload)

				switch (payload.eventType) {
					case 'INSERT': {
						const insertData = payload.new as Tables<'tabletop_lingering'>
						const characterType = characterLookup(insertData.tt_character_id)

						const queryKey = [campaignId, 'tabletop', characterType.toLowerCase(), insertData.tt_character_id]
						void queryClient.cancelQueries({ queryKey })

						if (characterType === 'ENEMY' && role !== 'gm') return

						queryClient.setQueriesData({ queryKey }, (oldData: TabletopHeroData | TabletopGMEnemyData) => {
							const lingeringData = lingeringDataFormatter({
								lingeringId: insertData.linger_id,
								decrementTime: insertData.decrement_time,
								data: insertData.data,
								remainingTime: insertData.remaining_time
							})
							return {
								...oldData,
								lingering: [
									...oldData.lingering.filter(linger => linger.lingeringId !== insertData.linger_id),
									lingeringData
								]
							} satisfies TabletopHeroData | TabletopGMEnemyData
						})
						break
					}
					case 'UPDATE': {
						const updateData = payload.new as Tables<'tabletop_lingering'>
						const characterType = characterLookup(updateData.tt_character_id)

						const queryKey = [campaignId, 'tabletop', characterType.toLowerCase(), updateData.tt_character_id]
						void queryClient.cancelQueries({ queryKey })

						if (characterType === 'ENEMY' && role !== 'gm') return

						queryClient.setQueriesData({ queryKey }, (oldData: TabletopHeroData | TabletopGMEnemyData) => {
							return {
								...oldData,
								lingering: oldData.lingering.map(linger => {
									if (linger.lingeringId === updateData.linger_id) {
										return { ...linger, remainingTime: updateData.remaining_time }
									}
									return linger
								})
							} satisfies TabletopHeroData | TabletopGMEnemyData
						})
						break
					}
					case 'DELETE': {
						const deleteData = payload.old as Tables<'tabletop_lingering'>
						const characterType = characterLookup(deleteData.tt_character_id)

						const queryKey = [campaignId, 'tabletop', characterType.toLowerCase(), deleteData.tt_character_id]
						void queryClient.cancelQueries({ queryKey })

						if (characterType === 'ENEMY' && role !== 'gm') return

						queryClient.setQueriesData({ queryKey }, (oldData: TabletopHeroData | TabletopGMEnemyData) => {
							return {
								...oldData,
								lingering: oldData.lingering.filter(linger => linger.lingeringId !== deleteData.linger_id)
							} satisfies TabletopHeroData | TabletopGMEnemyData
						})
						break
					}
				}
			})
			.subscribe(status => console.log(`${channelName} ${status}`))

		return () => {
			const channel = supabase.channel(channelName)
			void supabase.removeChannel(channel)
		}
	})
}
