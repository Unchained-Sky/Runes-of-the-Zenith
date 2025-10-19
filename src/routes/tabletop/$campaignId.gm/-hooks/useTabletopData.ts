import { queryOptions, useSuspenseQueries, useSuspenseQuery } from '@tanstack/react-query'
import { getRouteApi, redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { type } from 'arktype'
import { type CombatTile } from '~/data/mapTemplates/combat'
import { requireAccount } from '~/supabase/requireAccount'
import { typedObject } from '~/types/typedObject'

const tabletopLoaderSchema = type({
	campaignId: 'number'
})

/*
	Name
*/

const nameLoader = createServerFn({ method: 'GET' })
	.validator(tabletopLoaderSchema)
	.handler(async ({ data: { campaignId } }) => {
		const { supabase } = await requireAccount({ backlink: '/campaigns' })

		const { data, error } = await supabase
			.from('campaign_info')
			.select('campaignName: campaign_name')
			.eq('campaign_id', campaignId)
			.limit(1)
			.maybeSingle()
		if (error) throw new Error(error.message, { cause: error })
		if (!data) throw redirect({ to: '/campaign/$campaignId', params: { campaignId: campaignId.toString() } })

		return data.campaignName
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
	Map
*/

const tilesLoader = createServerFn({ method: 'GET' })
	.validator(tabletopLoaderSchema)
	.handler(async ({ data: { campaignId } }) => {
		const { supabase } = await requireAccount({ backlink: '/campaigns' })

		const { data, error } = await supabase
			.from('tabletop_tiles')
			.select(`
				q,
				r,
				s,
				character: tabletop_characters (
					characterId: character_id,
					characterType: character_type
				)
			`)
			.eq('campaign_id', campaignId)
		if (error) throw new Error(error.message, { cause: error })

		return typedObject.fromEntries(data.map(tile => [
			`${tile.q},${tile.r},${tile.s}` as const,
			tile.character
				? {
					characterId: tile.character.characterId,
					characterType: tile.character.characterType
				}
				: null
		]))
	})

export const tabletopTilesQueryOptions = (campaignId: number) => queryOptions({
	queryKey: ['tabletop', 'tiles', campaignId],
	queryFn: () => tilesLoader({ data: { campaignId } })
})

export function useTabletopTiles() {
	const { campaignId } = getRouteApi('/tabletop/$campaignId/gm/').useLoaderData()
	return useSuspenseQuery(tabletopTilesQueryOptions(campaignId))
}

const mapTilesLoader = createServerFn({ method: 'GET' })
	.validator(tabletopLoaderSchema)
	.handler(async ({ data: { campaignId } }) => {
		const { supabase } = await requireAccount({ backlink: '/campaigns' })

		const { data, error } = await supabase
			.from('tabletop_info')
			.select(`
				mapInfo: map_info (
					mapCombatTiles: map_combat_tile (
						q,
						r,
						s,
						image,
						terrainType: terrain_type
					)
				)
			`)
			.eq('campaign_id', campaignId)
			.limit(1)
			.maybeSingle()
		if (error) throw new Error(error.message, { cause: error })
		if (!data) return []

		return data.mapInfo.mapCombatTiles.map<CombatTile>(tile => ({
			cord: [tile.q, tile.r, tile.s],
			image: tile.image,
			terrainType: tile.terrainType
		}))
	})

export const tabletopMapTilesQueryOptions = (campaignId: number) => queryOptions({
	queryKey: ['tabletop', 'map-tiles', campaignId],
	queryFn: () => mapTilesLoader({ data: { campaignId } })
})

export function useTabletopMapTiles() {
	const { campaignId } = getRouteApi('/tabletop/$campaignId/gm/').useLoaderData()
	return useSuspenseQuery(tabletopMapTilesQueryOptions(campaignId))
}

const mapListLoader = createServerFn({ method: 'GET' })
	.handler(async () => {
		const { supabase, user } = await requireAccount({ backlink: '/campaigns' })

		const { data, error } = await supabase
			.from('map_info')
			.select(`
				mapId: map_id,
				mapName: map_name,
				mapCombatTileCount: map_combat_tile(count)
			`)
			.eq('user_id', user.id)
		if (error) throw new Error(error.message, { cause: error })

		const out = data.filter(map => map.mapCombatTileCount[0]?.count)

		return out.map(map => ({ mapId: map.mapId, name: map.mapName }))
	})

export const tabletopMapListQueryOptions = () => queryOptions({
	queryKey: ['tabletop', 'maps'],
	queryFn: () => mapListLoader()
})

export function useTabletopMapList() {
	return useSuspenseQuery(tabletopMapListQueryOptions())
}

/*
	Heroes
*/

export const heroListLoader = createServerFn({ method: 'GET' })
	.validator(tabletopLoaderSchema)
	.handler(async ({ data: { campaignId } }) => {
		const { supabase } = await requireAccount({ backlink: '/campaigns' })

		const { data, error } = await supabase
			.from('hero_info')
			.select('heroId: hero_id')
			.eq('campaign_id', campaignId)
		if (error) throw new Error(error.message, { cause: error })

		return data.map(hero => hero.heroId)
	})

export const tabletopHeroListQueryOptions = (campaignId: number) => queryOptions({
	queryKey: ['tabletop', 'hero-list', campaignId],
	queryFn: () => heroListLoader({ data: { campaignId } }),
	staleTime: Infinity
})

export function useTabletopHeroList() {
	const { campaignId } = getRouteApi('/tabletop/$campaignId/gm/').useLoaderData()
	return useSuspenseQuery(tabletopHeroListQueryOptions(campaignId))
}

const heroLoaderSchema = tabletopLoaderSchema.and({
	heroId: 'number'
})

export const heroLoader = createServerFn({ method: 'GET' })
	.validator(heroLoaderSchema)
	.handler(async ({ data: { campaignId, heroId } }) => {
		const { supabase } = await requireAccount({ backlink: '/campaigns' })

		const { data, error } = await supabase
			.from('hero_info')
			.select(`
				heroId: hero_id,
				heroName: hero_name,
				tabletopHero: tabletop_heroes (
					characterId: character_id
				)
			`)
			.eq('hero_id', heroId)
			.limit(1)
			.single()
		if (error) throw redirect({ to: '/campaign/$campaignId', params: { campaignId: campaignId.toString() } })

		return data
	})

const tabletopHeroQueryOptions = (campaignId: number, heroId: number) => queryOptions({
	queryKey: ['tabletop', 'hero', campaignId, heroId],
	queryFn: () => heroLoader({ data: { campaignId, heroId } })
})

export function useTabletopHeroes() {
	const { campaignId } = getRouteApi('/tabletop/$campaignId/gm/').useLoaderData()
	const heroIds = useTabletopHeroList().data
	const queries = useSuspenseQueries({
		queries: heroIds.map(heroId => tabletopHeroQueryOptions(campaignId, heroId))
		// combine: data => {
		// 	return {
		// 		data: Object.fromEntries(data.map(hero => [hero.data.heroId, hero.data]))
		// 	}
		// }
	})

	// using the built in combine wasn't updating when setting the data manually in the subscriptions
	const combine = typedObject.fromEntries(queries.map(hero => [hero.data.heroId, hero.data]))

	return {
		data: combine,
		queries
	}
}
