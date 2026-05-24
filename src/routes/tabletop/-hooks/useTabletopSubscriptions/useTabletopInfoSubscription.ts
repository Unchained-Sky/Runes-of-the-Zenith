import useMountEffect from '~/hooks/useMountEffect'
import { LOG_SUBSCRIPTION_PAYLOADS } from '~/routes/tabletop/-hooks/useTabletopSubscriptions/useTabletopSubscriptions'
import { useTabletopContext } from '~/routes/tabletop/-utils/TabletopContext'
import { type Tables } from '~/supabase/databaseTypes'
import { useSupabase } from '~/supabase/useSupabase'
import { type TabletopRoundData } from '../tabletopData/useTabletopRound'

export default function useTabletopInfoSubscription() {
	const { supabase } = useSupabase()
	const { queryClient, campaignId } = useTabletopContext()

	useMountEffect(() => {
		const channelName = `tabletop_info:${campaignId}`
		supabase
			.channel(channelName)
			.on('postgres_changes', {
				event: '*',
				schema: 'public',
				table: 'tabletop_info'
			}, payload => {
				if (LOG_SUBSCRIPTION_PAYLOADS) console.log(payload)

				switch (payload.eventType) {
					case 'INSERT': {
						break
					}
					case 'UPDATE': {
						const updateData = payload.new as Tables<'tabletop_info'>
						const queryKey = [campaignId, 'tabletop', 'round']
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
			.subscribe(status => console.log(`${channelName} ${status}`))

		return () => {
			const channel = supabase.channel(channelName)
			void supabase.removeChannel(channel)
		}
	})
}
