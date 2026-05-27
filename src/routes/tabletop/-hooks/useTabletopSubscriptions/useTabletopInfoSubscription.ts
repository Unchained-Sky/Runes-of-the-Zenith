import { useQueryClient } from '@tanstack/react-query'
import useMountEffect from '~/hooks/useMountEffect'
import { LOG_SUBSCRIPTION_PAYLOADS, LOG_SUBSCRIPTION_STATUS, type TabletopSubscriptionProps } from '~/routes/tabletop/-hooks/useTabletopSubscriptions/useTabletopSubscriptions'
import { type Tables } from '~/supabase/databaseTypes'
import { useSupabase } from '~/supabase/useSupabase'
import getQueryKey from '../../-utils/getQueryKey'
import { type TabletopRoundData } from '../tabletopData/useTabletopRound'

export default function useTabletopInfoSubscription({ channelName, table }: TabletopSubscriptionProps) {
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
						break
					}
					case 'UPDATE': {
						const updateData = payload.new as Tables<'tabletop_info'>
						const queryKey = getQueryKey({ type: 'round' })
						void queryClient.cancelQueries({ queryKey })
						queryClient.setQueryData(queryKey, (oldData: TabletopRoundData) => {
							return {
								...oldData,
								round: updateData.round
							}
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
