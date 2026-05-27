import useMountEffect from '~/hooks/useMountEffect'
import { LOG_SUBSCRIPTION_PAYLOADS, LOG_SUBSCRIPTION_STATUS, type TabletopSubscriptionProps } from '~/routes/tabletop/-hooks/useTabletopSubscriptions/useTabletopSubscriptions'
import { useSupabase } from '~/supabase/useSupabase'

export default function useTabletopHeroesSubscription({ channelName, table }: TabletopSubscriptionProps) {
	const { supabase } = useSupabase()

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
