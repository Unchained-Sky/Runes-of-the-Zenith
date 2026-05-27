import { useQueryClient } from '@tanstack/react-query'
import useMountEffect from '~/hooks/useMountEffect'
import { type Tables } from '~/supabase/databaseTypes'
import { useSupabase } from '~/supabase/useSupabase'
import { type TabletopGMEnemyData } from '../../$campaignId.gm/-hooks/tabletopData/useGMTabletopEnemies'
import getQueryKey from '../../-utils/getQueryKey'
import { lingeringDataFormatter } from '../../-utils/lingeringData'
import { type TabletopHeroData } from '../tabletopData/useTabletopHeroes'
import { useTabletopEnvironmentStore } from '../useTabletopEnvironmentStore'
import { LOG_SUBSCRIPTION_PAYLOADS, LOG_SUBSCRIPTION_STATUS, type TabletopSubscriptionProps } from './useTabletopSubscriptions'

export default function useTabletopLingeringSubscription({ channelName, table }: TabletopSubscriptionProps) {
	const { supabase } = useSupabase()
	const queryClient = useQueryClient()

	useMountEffect(() => {
		const channel = supabase
			.channel(channelName)
			.on('postgres_changes', {
				event: '*',
				schema: 'public',
				table
			}, payload => {
				if (LOG_SUBSCRIPTION_PAYLOADS) console.log(payload)

				const { role } = useTabletopEnvironmentStore.getState()

				switch (payload.eventType) {
					case 'INSERT': {
						const insertData = payload.new as Tables<'tabletop_lingering'>

						const { queryKey, characterType } = getQueryKey({ type: 'character', data: { tabletopCharacterId: insertData.tt_character_id, queryClient } })
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

						const { queryKey, characterType } = getQueryKey({ type: 'character', data: { tabletopCharacterId: updateData.tt_character_id, queryClient } })
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

						const { queryKey, characterType } = getQueryKey({ type: 'character', data: { tabletopCharacterId: deleteData.tt_character_id, queryClient } })
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
			.subscribe(status => LOG_SUBSCRIPTION_STATUS && console.log(`${channelName} ${status}`))

		return () => void supabase.removeChannel(channel)
	})
}
