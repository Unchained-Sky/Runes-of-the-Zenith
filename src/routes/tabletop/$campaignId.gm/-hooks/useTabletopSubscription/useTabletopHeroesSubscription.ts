import { getRouteApi } from '@tanstack/react-router'
import useMountEffect from '~/hooks/useMountEffect'
import { type Tables } from '~/supabase/databaseTypes'
import { LOG_SUBSCRIPTION_PAYLOADS, type SubscribeHookProps } from './useTabletopSubscription'

type TabletopHeroesTable = Tables<'tabletop_heroes'>

export default function useTabletopHeroesSubscription({ supabase, campaignId }: SubscribeHookProps) {
	const { queryClient } = getRouteApi('/tabletop/$campaignId/gm/').useRouteContext()

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
						const { tt_character_id: tabletopCharacterId } = payload.new as TabletopHeroesTable
						void queryClient.invalidateQueries({ queryKey: [campaignId, 'tabletop', 'hero', tabletopCharacterId] })
						void queryClient.invalidateQueries({ queryKey: [campaignId, 'tabletop', 'tiles'] })
						break
					}
					case 'UPDATE': {
						const { hero_id: _ } = payload.new as TabletopHeroesTable
						break

						// const heroesCache = queryClient.getQueryData(['tabletop', 'heroes', campaignId]) as TabletopHeroesCache
						// const updatedHeroName = heroesCache[hero_id]?.heroName
						// if (!updatedHeroName) {
						// 	void queryClient.invalidateQueries({ queryKey: ['tabletop', 'heroes', campaignId] })
						// 	break
						// }

						// queryClient.setQueryData(['tabletop', 'heroes', campaignId], (oldData: TabletopHeroesCache) => {
						// 	return {
						// 		...oldData,
						// 		[hero_id]: {
						// 			heroId: hero_id,
						// 			heroName: updatedHeroName
						// 			// tabletopHero: tabletopHeroData
						// 		}
						// 		// } satisfies TabletopHeroesCache[string]
						// 	}
						// })
						// break
					}
					case 'DELETE': {
						const { tt_character_id: tabletopCharacterId } = payload.old as TabletopHeroesTable
						queryClient.setQueriesData({ queryKey: [campaignId, 'tabletop', 'hero', tabletopCharacterId] }, () => {
							return null
						})
						break
					}
				}
			})
			.subscribe(status => console.log(`tabletop_heroes:${campaignId} ${status}`))

		return () => {
			const channel = supabase.channel(channelName)
			void supabase.removeChannel(channel)
		}
	})
}
