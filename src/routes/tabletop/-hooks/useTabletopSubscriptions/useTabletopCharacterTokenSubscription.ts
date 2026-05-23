import useMountEffect from '~/hooks/useMountEffect'
import { type Tables } from '~/supabase/databaseTypes'
import { useSupabase } from '~/supabase/useSupabase'
import { type TabletopGMEnemyData } from '../../$campaignId.gm/-hooks/tabletopData/useGMTabletopEnemies'
import { useTabletopContext } from '../../-utils/TabletopContext'
import useCharacterLookup from '../../-utils/useCharacterLookup'
import { type TabletopHeroData } from '../tabletopData/useTabletopHeroes'
import { LOG_SUBSCRIPTION_PAYLOADS } from './useTabletopSubscriptions'

export default function useTabletopCharacterTokenSubscription() {
	const { supabase } = useSupabase()
	const { queryClient, campaignId, role } = useTabletopContext()

	const characterLookup = useCharacterLookup()

	useMountEffect(() => {
		const channelName = `tabletop_character_token:${campaignId}`
		supabase
			.channel(channelName)
			.on('postgres_changes', {
				event: '*',
				schema: 'public',
				table: 'tabletop_character_token'
			}, payload => {
				if (LOG_SUBSCRIPTION_PAYLOADS) console.log(payload)

				switch (payload.eventType) {
					case 'INSERT': {
						const insertData = payload.new as Tables<'tabletop_character_token'>
						const characterType = characterLookup(insertData.tt_character_id)

						const queryKey = [campaignId, 'tabletop', characterType.toLowerCase(), insertData.tt_character_id]
						void queryClient.invalidateQueries({ queryKey })

						if (characterType === 'ENEMY' && role !== 'gm') return

						queryClient.setQueriesData({ queryKey }, (oldData: TabletopHeroData | TabletopGMEnemyData) => {
							return {
								...oldData,
								tokens: [
									...oldData.tokens.filter(token => token.name !== insertData.token_name),
									{ name: insertData.token_name, amount: insertData.amount }
								]
							} satisfies TabletopHeroData | TabletopGMEnemyData
						})
						break
					}
					case 'UPDATE': {
						const updateData = payload.new as Tables<'tabletop_character_token'>
						const characterType = characterLookup(updateData.tt_character_id)

						const queryKey = [campaignId, 'tabletop', characterType.toLowerCase(), updateData.tt_character_id]
						void queryClient.invalidateQueries({ queryKey })

						if (characterType === 'ENEMY' && role !== 'gm') return

						queryClient.setQueriesData({ queryKey }, (oldData: TabletopHeroData | TabletopGMEnemyData) => {
							return {
								...oldData,
								tokens: oldData.tokens.map(token => {
									if (token.name === updateData.token_name) {
										return { name: token.name, amount: updateData.amount }
									}
									return token
								})
							} satisfies TabletopHeroData | TabletopGMEnemyData
						})
						break
					}
					case 'DELETE': {
						const deleteData = payload.old as Tables<'tabletop_character_token'>
						const characterType = characterLookup(deleteData.tt_character_id)

						const queryKey = [campaignId, 'tabletop', characterType.toLowerCase(), deleteData.tt_character_id]
						void queryClient.invalidateQueries({ queryKey })

						if (characterType === 'ENEMY' && role !== 'gm') return

						queryClient.setQueriesData({ queryKey }, (oldData: TabletopHeroData | TabletopGMEnemyData) => {
							return {
								...oldData,
								tokens: oldData.tokens.filter(token => token.name !== deleteData.token_name)
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
