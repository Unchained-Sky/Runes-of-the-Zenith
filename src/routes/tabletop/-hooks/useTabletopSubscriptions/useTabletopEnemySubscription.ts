import useMountEffect from '~/hooks/useMountEffect'
import { type Tables } from '~/supabase/databaseTypes'
import { useSupabase } from '~/supabase/useSupabase'
import { type TabletopGMEnemyData } from '../../$campaignId.gm/-hooks/tabletopData/useGMTabletopEnemies'
import { type TabletopPlayerEnemyData } from '../../$campaignId.player/-hooks/tabletopData/usePlayerTabletopEnemies'
import { useTabletopContext } from '../../-utils/TabletopContext'
import { LOG_SUBSCRIPTION_PAYLOADS } from './useTabletopSubscriptions'

export default function useTabletopEnemySubscription() {
	const { supabase } = useSupabase()
	const { queryClient, campaignId, role } = useTabletopContext()

	useMountEffect(() => {
		const channelName = `tabletop_enemy:${campaignId}`
		supabase
			.channel(channelName)
			.on('postgres_changes', {
				event: '*',
				schema: 'public',
				table: 'tabletop_enemy'
			}, payload => {
				if (LOG_SUBSCRIPTION_PAYLOADS) console.log(payload)

				switch (payload.eventType) {
					case 'INSERT': {
						break
					}
					case 'UPDATE': {
						const updateData = payload.new as Tables<'tabletop_enemy'>

						const queryKey = [campaignId, `tabletop-${role}`, 'enemy', updateData.tt_character_id]
						void queryClient.invalidateQueries({ queryKey })
						queryClient.setQueriesData({ queryKey }, (oldData: TabletopGMEnemyData | TabletopPlayerEnemyData) => {
							return {
								...oldData,
								tabletopStats: {
									...oldData.tabletopStats,
									currentAggression: updateData.current_aggression
								}
							} satisfies TabletopGMEnemyData | TabletopPlayerEnemyData
						})
						break
					}
					case 'DELETE': {
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
