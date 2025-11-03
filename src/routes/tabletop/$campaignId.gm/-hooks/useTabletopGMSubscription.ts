import { type SupabaseClient } from '@supabase/supabase-js'
import { getRouteApi } from '@tanstack/react-router'
import useMountEffect from '~/hooks/useMountEffect'
import { type Database, type Tables } from '~/supabase/databaseTypes'
import { useSupabase } from '~/supabase/useSupabase'
import { typedObject } from '~/types/typedObject'
import { type useTabletopHeroes, type useTabletopTiles } from './useTabletopData'

const LOG_PAYLOADS = process.env.NODE_ENV === 'development'

export default function useTabletopGMSubscription() {
	const supabase = useSupabase()

	const { campaignId } = getRouteApi('/tabletop/$campaignId/gm/').useLoaderData()

	useTabletopHeroesSubscription({ supabase, campaignId })
	useTabletopInfoSubscription({ supabase, campaignId })
	useTabletopCharactersSubscription({ supabase, campaignId })
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

				if (LOG_PAYLOADS) console.log(payload)

				switch (payload.eventType) {
					case 'INSERT': {
						const { hero_id } = payload.new as TabletopHeroes
						void queryClient.invalidateQueries({ queryKey: [campaignId, 'tabletop', 'hero', hero_id] })
						void queryClient.invalidateQueries({ queryKey: [campaignId, 'tabletop', 'tiles'] })
						break
					}
					case 'UPDATE': {
						const { hero_id: _ } = payload.new as TabletopHeroes
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
						const { hero_id } = payload.old as TabletopHeroes
						queryClient.setQueriesData({ queryKey: [campaignId, 'tabletop', 'hero', hero_id] }, (oldData: TabletopHeroesCache[number]) => {
							return {
								...oldData,
								tabletopHero: null
							} satisfies TabletopHeroesCache[number]
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
				if (LOG_PAYLOADS) console.log(payload)

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

function useTabletopCharactersSubscription({ supabase, campaignId }: SubscribeHookProps) {
	const { queryClient } = getRouteApi('/tabletop/$campaignId/gm/').useRouteContext()

	useMountEffect(() => {
		const channelName = `tabletop_characters:${campaignId}`
		supabase
			.channel(channelName)
			.on('postgres_changes', {
				event: '*',
				schema: 'public',
				table: 'tabletop_characters'
			}, payload => {
				type TabletopCharacters = Tables<'tabletop_characters'>

				if (LOG_PAYLOADS) console.log(payload)

				switch (payload.eventType) {
					case 'INSERT': {
						void queryClient.invalidateQueries({ queryKey: [campaignId, 'tabletop', 'tiles'] })
						break
					}
					case 'UPDATE': {
						void queryClient.invalidateQueries({ queryKey: [campaignId, 'tabletop', 'tiles'] })
						break
					}
					case 'DELETE': {
						const { tt_character_id } = payload.old as TabletopCharacters

						type TabletopTilesCache = ReturnType<typeof useTabletopTiles>['data']
						const tilesCache = queryClient.getQueryData([campaignId, 'tabletop', 'tiles', 'characters']) as TabletopTilesCache
						const tilesArray = typedObject.entries(tilesCache)
						const tileIndex = tilesArray.findIndex(([_cord, tile]) => tile && tile.characterType === 'HERO' && tile.tabletopCharacterId === tt_character_id)
						const tileData = tilesArray[tileIndex]
						if (tileData) {
							void queryClient.cancelQueries({ queryKey: [campaignId, 'tabletop', 'tiles'] })
							queryClient.setQueryData(['tabletop', 'tiles', 'characters', campaignId], (oldData: TabletopTilesCache) => {
								return {
									...oldData,
									[tileData[0]]: null
								}
							})
						}
						break
					}
				}
			})
			.subscribe(status => console.log(`tabletop_characters:${campaignId} ${status}`))

		return () => {
			const channel = supabase.channel(channelName)
			void supabase.removeChannel(channel)
		}
	})
}
