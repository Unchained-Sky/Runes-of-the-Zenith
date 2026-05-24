import useMountEffect from '~/hooks/useMountEffect'
import { LOG_SUBSCRIPTION_PAYLOADS } from '~/routes/tabletop/-hooks/useTabletopSubscriptions/useTabletopSubscriptions'
import { useTabletopContext } from '~/routes/tabletop/-utils/TabletopContext'
import { useSupabase } from '~/supabase/useSupabase'

export default function useTabletopHeroesSubscription() {
	const { supabase } = useSupabase()
	const { queryClient: _queryClient, campaignId } = useTabletopContext()

	useMountEffect(() => {
		const channelName = `tabletop_heroes:${campaignId}`
		supabase
			.channel(channelName)
			.on('postgres_changes', {
				event: '*',
				schema: 'public',
				table: 'tabletop_heroes'
			}, payload => {
				if (LOG_SUBSCRIPTION_PAYLOADS) console.log(payload)

				switch (payload.eventType) {
					case 'INSERT': {
						break
					}
					case 'UPDATE': {
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
