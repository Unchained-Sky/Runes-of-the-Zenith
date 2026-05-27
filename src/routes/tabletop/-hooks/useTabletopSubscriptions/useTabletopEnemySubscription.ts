import { useQueryClient } from '@tanstack/react-query'
import useMountEffect from '~/hooks/useMountEffect'
import { type Tables } from '~/supabase/databaseTypes'
import { useSupabase } from '~/supabase/useSupabase'
import { type TabletopGMEnemyData } from '../../$campaignId.gm/-hooks/tabletopData/useGMTabletopEnemies'
import { type TabletopPlayerEnemyData } from '../../$campaignId.player/-hooks/tabletopData/usePlayerTabletopEnemies'
import getQueryKey from '../../-utils/getQueryKey'
import { type TabletopEnemyList } from '../tabletopData/useTabletopEnemyList'
import { LOG_SUBSCRIPTION_PAYLOADS, LOG_SUBSCRIPTION_STATUS, type TabletopSubscriptionProps } from './useTabletopSubscriptions'

export default function useTabletopEnemySubscription({ channelName, table }: TabletopSubscriptionProps) {
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

				switch (payload.eventType) {
					case 'INSERT': {
						const insertData = payload.new as Tables<'tabletop_enemy'>

						const queryKey = getQueryKey({ type: 'enemy-list' })
						void queryClient.cancelQueries({ queryKey })
						queryClient.setQueryData(queryKey, (oldData: TabletopEnemyList) => {
							return [...oldData, insertData.tt_character_id]
						})
						break
					}
					case 'UPDATE': {
						const updateData = payload.new as Tables<'tabletop_enemy'>

						const queryKey = getQueryKey({ type: 'enemy', data: { tabletopCharacterId: updateData.tt_character_id } })
						void queryClient.cancelQueries({ queryKey })
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
			.subscribe(status => LOG_SUBSCRIPTION_STATUS && console.log(`${channelName} ${status}`))

		return () => void supabase.removeChannel(channel)
	})
}
