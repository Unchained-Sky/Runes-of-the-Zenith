import { type SupabaseClient } from '@supabase/supabase-js'
import { getRouteApi } from '@tanstack/react-router'
import useMountEffect from '~/hooks/useMountEffect'
import { type Database, type Tables } from '~/supabase/databaseTypes'
import { useSupabase } from '~/supabase/useSupabase'
import { type useTabletopHeroes } from './-useTabletopData'

export default function useTabletopGMSubscription() {
	const supabase = useSupabase()

	const { campaignId } = getRouteApi('/tabletop/$campaignId/gm/').useLoaderData()

	useTabletopHeroesSubscription({ supabase, campaignId })
	useTabletopInfoSubscription({ supabase, campaignId })
}

type SubscribeHookProps = {
	supabase: SupabaseClient<Database>
	campaignId: number
}

function useTabletopHeroesSubscription({ supabase, campaignId }: SubscribeHookProps) {
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
				type TabletopHeroes = Tables<'tabletop_heroes'>
				type TabletopHeroesCache = ReturnType<typeof useTabletopHeroes>['data']
				switch (payload.eventType) {
					case 'INSERT': {
						void queryClient.invalidateQueries({ queryKey: ['tabletop', 'heroes', campaignId] })
						break
					}
					case 'UPDATE': {
						const { hero_id, ...tabletopHeroData } = payload.new as TabletopHeroes

						const heroesCache = queryClient.getQueryData(['tabletop', 'heroes', campaignId]) as TabletopHeroesCache
						const updatedHeroName = heroesCache[hero_id]?.hero_name
						if (!updatedHeroName) {
							void queryClient.invalidateQueries({ queryKey: ['tabletop', 'heroes', campaignId] })
							break
						}

						queryClient.setQueryData(['tabletop', 'heroes', campaignId], (oldData: TabletopHeroesCache) => {
							return {
								...oldData,
								[hero_id]: {
									hero_id,
									hero_name: updatedHeroName,
									tabletop_heroes: tabletopHeroData
								} satisfies TabletopHeroesCache[string]
							}
						})
						break
					}
					case 'DELETE': {
						const { hero_id } = payload.old as TabletopHeroes
						queryClient.setQueryData(['tabletop', 'heroes', campaignId], (oldData: TabletopHeroesCache) => {
							return {
								...oldData,
								[hero_id]: {
									...oldData[hero_id],
									tabletop_heroes: null
								}
							}
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

function useTabletopInfoSubscription({ supabase, campaignId }: SubscribeHookProps) {
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
				switch (payload.eventType) {
					case 'INSERT':
					case 'UPDATE': {
						void queryClient.invalidateQueries({ queryKey: ['tabletop', 'tiles', campaignId] })
						break
					}
					case 'DELETE': {
						queryClient.setQueryData(['tabletop', 'tiles', campaignId], [])
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
