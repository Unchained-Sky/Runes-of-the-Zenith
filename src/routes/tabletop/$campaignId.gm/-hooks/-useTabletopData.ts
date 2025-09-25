import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { getRouteApi, redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { type } from 'arktype'
import { type CombatTile } from '~/data/mapTemplates/combat'
import { requireAccount } from '~/supabase/requireAccount'

const tabletopLoaderSchema = type({
	campaignId: 'number'
})

/*
	Name
*/

const nameLoader = createServerFn({ method: 'GET' })
	.validator(tabletopLoaderSchema)
	.handler(async ({ data: { campaignId } }) => {
		const { supabase, user } = await requireAccount({ backlink: '/campaigns' })

		const { data, error } = await supabase
			.from('campaign_info')
			.select('campaign_name')
			.eq('campaign_id', campaignId)
			.eq('user_id', user.id)
			.limit(1)
			.maybeSingle()
		if (error) throw new Error(error.message, { cause: error })
		if (!data) throw redirect({ to: '/campaign/$campaignId', params: { campaignId: campaignId.toString() } })

		return data.campaign_name
	})

export const tabletopNameQueryOptions = (campaignId: number) => queryOptions({
	queryKey: ['tabletop', 'name', campaignId],
	queryFn: () => nameLoader({ data: { campaignId } }),
	staleTime: Infinity
})

export function useTabletopName() {
	const { campaignId } = getRouteApi('/tabletop/$campaignId/gm/').useLoaderData()
	return useSuspenseQuery(tabletopNameQueryOptions(campaignId))
}

/*
	Tiles
*/

const tilesLoader = createServerFn({ method: 'GET' })
	.validator(tabletopLoaderSchema)
	.handler(async ({ data: { campaignId } }) => {
		const { supabase } = await requireAccount({ backlink: '/campaigns' })

		const { data, error } = await supabase
			.from('tabletop_info')
			.select(`
				map_info(
					map_combat_tile(
						q,
						r,
						s,
						image,
						terrain_type
					)
				)
			`)
			.eq('campaign_id', campaignId)
			.limit(1)
			.maybeSingle()
		if (error) throw new Error(error.message, { cause: error })
		if (!data) return []

		return data.map_info.map_combat_tile.map<CombatTile>(tile => ({
			cord: [tile.q, tile.r, tile.s],
			image: tile.image,
			terrainType: tile.terrain_type
		}))
	})

export const tabletopTilesQueryOptions = (campaignId: number) => queryOptions({
	queryKey: ['tabletop', 'tiles', campaignId],
	queryFn: () => tilesLoader({ data: { campaignId } })
})

export function useTabletopTiles() {
	const { campaignId } = getRouteApi('/tabletop/$campaignId/gm/').useLoaderData()
	return useSuspenseQuery(tabletopTilesQueryOptions(campaignId))
}

/*
	Maps
*/

const mapsLoader = createServerFn({ method: 'GET' })
	.handler(async () => {
		const { supabase, user } = await requireAccount({ backlink: '/campaigns' })

		const { data, error } = await supabase
			.from('map_info')
			.select(`
				map_id,
				map_name,
				mapCombatTileCount: map_combat_tile(count)
			`)
			.eq('user_id', user.id)
		if (error) throw new Error(error.message, { cause: error })

		const out = data.filter(map => map.mapCombatTileCount[0]?.count)

		return out.map(map => ({ mapId: map.map_id, name: map.map_name }))
	})

export const tabletopMapsQueryOptions = () => queryOptions({
	queryKey: ['tabletop', 'maps'],
	queryFn: () => mapsLoader()
})

export function useTabletopMaps() {
	return useSuspenseQuery(tabletopMapsQueryOptions())
}

/*
	Heroes
*/

const heroesLoader = createServerFn({ method: 'GET' })
	.validator(tabletopLoaderSchema)
	.handler(async ({ data: { campaignId } }) => {
		const { supabase } = await requireAccount({ backlink: '/campaigns' })

		const { data, error } = await supabase
			.from('hero_info')
			.select(`
				hero_id,
				hero_name,
				tabletop_heroes (
					shield_durability,
					shield_current,
					shield_max,
					health_current,
					health_max,
					position_q,
					position_r,
					position_s
				)
			`)
			.eq('campaign_id', campaignId)
		if (error) throw redirect({ to: '/campaign/$campaignId', params: { campaignId: campaignId.toString() } })

		return Object.fromEntries(data.map(hero => [
			hero.hero_id,
			hero
		]))
	})

export const tabletopHeroesQueryOptions = (campaignId: number) => queryOptions({
	queryKey: ['tabletop', 'heroes', campaignId],
	queryFn: () => heroesLoader({ data: { campaignId } })
})

export function useTabletopHeroes() {
	const { campaignId } = getRouteApi('/tabletop/$campaignId/gm/').useLoaderData()
	return useSuspenseQuery(tabletopHeroesQueryOptions(campaignId))
}
