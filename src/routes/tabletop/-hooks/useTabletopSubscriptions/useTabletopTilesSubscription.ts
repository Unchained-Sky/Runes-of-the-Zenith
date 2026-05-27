import { useQueryClient } from '@tanstack/react-query'
import useMountEffect from '~/hooks/useMountEffect'
import { LOG_SUBSCRIPTION_PAYLOADS, LOG_SUBSCRIPTION_STATUS, type TabletopSubscriptionProps } from '~/routes/tabletop/-hooks/useTabletopSubscriptions/useTabletopSubscriptions'
import { type Tables } from '~/supabase/databaseTypes'
import { useSupabase } from '~/supabase/useSupabase'
import { queryCharacterLookup } from '../../-utils/characterLookup'
import getQueryKey from '../../-utils/getQueryKey'
import { type TabletopTiles } from '../tabletopData/useTabletopTiles'

type TabletopTilesTable = Omit<Tables<'tabletop_tiles'>, 'tt_character_id'> & { tt_character_id?: number | null }

export default function useTabletopTilesSubscription({ channelName, table }: TabletopSubscriptionProps) {
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
					case 'INSERT':
					case 'UPDATE': {
						const upsertData = payload.new as Tables<'tabletop_tiles'>

						const queryKey = getQueryKey({ type: 'tiles-character' })
						void queryClient.cancelQueries({ queryKey })
						queryClient.setQueryData(queryKey, (oldData: TabletopTiles) => {
							const cords = `${upsertData.q},${upsertData.r},${upsertData.s}` as const
							return {
								...oldData,
								[cords]: upsertData.tt_character_id
									? {
										tabletopCharacterId: upsertData.tt_character_id,
										characterType: queryCharacterLookup({ queryClient, tabletopCharacterId: upsertData.tt_character_id })
									}
									: null
							} satisfies TabletopTiles
						})
						break
					}
					case 'DELETE': {
						const deleteData = payload.old as TabletopTilesTable

						const queryKey = getQueryKey({ type: 'tiles-character' })
						void queryClient.cancelQueries({ queryKey })
						queryClient.setQueryData(queryKey, (oldData: TabletopTiles) => {
							const cords = `${deleteData.q},${deleteData.r},${deleteData.s}` as const
							return {
								...oldData,
								[cords]: null
							} satisfies TabletopTiles
						})
						break
					}
				}
			})
			.subscribe(status => LOG_SUBSCRIPTION_STATUS && console.log(`${channelName} ${status}`))

		return () => void supabase.removeChannel(channel)
	})
}
