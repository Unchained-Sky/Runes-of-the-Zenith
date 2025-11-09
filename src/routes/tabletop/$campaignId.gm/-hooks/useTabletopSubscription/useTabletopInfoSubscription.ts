import { getRouteApi } from '@tanstack/react-router'
import useMountEffect from '~/hooks/useMountEffect'
import { type SubscribeHookProps, LOG_SUBSCRIPTION_PAYLOADS } from './useTabletopSubscription'

export default function useTabletopInfoSubscription({ supabase, campaignId }: SubscribeHookProps) {
	const { queryClient } = getRouteApi('/tabletop/$campaignId/gm/').useRouteContext()

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
					case 'INSERT':
					case 'UPDATE': {
						void queryClient.invalidateQueries({ queryKey: [campaignId, 'tabletop', 'tiles'] })
						void queryClient.invalidateQueries({ queryKey: [campaignId, 'tabletop', 'encounter-name'] })
						void queryClient.invalidateQueries({ queryKey: [campaignId, 'tabletop', 'enemy'] })
						break
					}
					case 'DELETE': {
						void queryClient.cancelQueries({ queryKey: [campaignId, 'tabletop', 'tiles'] })
						queryClient.setQueryData([campaignId, 'tabletop', 'tiles'], [])
						break
					}
				}
			})
			.subscribe(status => console.log(`tabletop_info:${campaignId} ${status}`))

		return () => {
			const channel = supabase.channel(channelName)
			void supabase.removeChannel(channel)
		}
	})
}
