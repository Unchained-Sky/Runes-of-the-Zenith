import { queryOptions, useSuspenseQueries, useSuspenseQuery } from '@tanstack/react-query'
import { getRouteApi, redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { type } from 'arktype'
import { adminUUID } from '~/supabase/adminAccount'
import { requireAccount } from '~/supabase/requireAccount'
import { type CombatTile } from '~/types/gameTypes/combatMap'
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
	queryKey: ['tabletop', 'tiles', campaignId, 'characters'],
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
				encounterId: encounter_id (
					mapInfo: map_info (
						mapCombatTiles: map_combat_tile (
							q,
							r,
							s,
							image,
							terrainType: terrain_type
						)
					)
				)
			`)
			.eq('campaign_id', campaignId)
			.limit(1)
			.maybeSingle()
		if (error) throw new Error(error.message, { cause: error })
		if (!data || !data.encounterId) return []

		return data.encounterId.mapInfo.mapCombatTiles.map<CombatTile>(tile => ({
			cord: [tile.q, tile.r, tile.s],
			image: tile.image,
			terrainType: tile.terrainType
		}))
	})

export const tabletopMapTilesQueryOptions = (campaignId: number) => queryOptions({
	queryKey: ['tabletop', 'tiles', campaignId, 'map'],
	queryFn: () => mapTilesLoader({ data: { campaignId } })
})

export function useTabletopMapTiles() {
	const { campaignId } = getRouteApi('/tabletop/$campaignId/gm/').useLoaderData()
	return useSuspenseQuery(tabletopMapTilesQueryOptions(campaignId))
}

/*
	Encounters
*/

const currentEncounterLoader = createServerFn({ method: 'GET' })
	.validator(tabletopLoaderSchema)
	.handler(async ({ data: { campaignId } }) => {
		const { supabase } = await requireAccount({ backlink: '/campaigns' })

		const { data, error } = await supabase
			.from('tabletop_info')
			.select(`
				encounterInfo: encounter_info (
					encounterName: encounter_name
				)
			`)
			.eq('campaign_id', campaignId)
			.limit(1)
			.maybeSingle()
		if (error) throw new Error(error.message, { cause: error })

		return data?.encounterInfo?.encounterName ?? null
	})

export const tabletopCurrentEncounterQueryOptions = (campaignId: number) => queryOptions({
	queryKey: ['tabletop', 'encounter-name', campaignId],
	queryFn: () => currentEncounterLoader({ data: { campaignId } })
})

export function useTabletopCurrentEncounter() {
	const { campaignId } = getRouteApi('/tabletop/$campaignId/gm/').useLoaderData()
	return useSuspenseQuery(tabletopCurrentEncounterQueryOptions(campaignId))
}

const encounterListLoader = createServerFn({ method: 'GET' })
	.validator(tabletopLoaderSchema)
	.handler(async ({ data: { campaignId } }) => {
		const { supabase, user } = await requireAccount({ backlink: '/campaigns' })

		const tabletopInfo = await supabase
			.from('tabletop_info')
			.select('encounter_id')
			.eq('campaign_id', campaignId)
			.limit(1)
			.maybeSingle()
		if (tabletopInfo.error) throw new Error(tabletopInfo.error.message, { cause: tabletopInfo.error })

		if (!tabletopInfo.data) {
			const { error } = await supabase
				.from('tabletop_info')
				.insert({ campaign_id: campaignId, map_id: -1 }) // TODO remove map_id
			if (error) throw new Error(error.message, { cause: error })
		}

		const compendiumEncounters = await supabase
			.from('encounter_info')
			.select(`
				encounterId: encounter_id,
				encounterName: encounter_name
			`)
			.eq('user_id', adminUUID)
		if (compendiumEncounters.error) throw new Error(compendiumEncounters.error.message, { cause: compendiumEncounters.error })

		const homebrewEncounters = await supabase
			.from('encounter_info')
			.select(`
				encounterId: encounter_id,
				encounterName: encounter_name,
				mapInfo: map_info (
					mapCombatTileCount: map_combat_tile(count)
				)
			`)
			.eq('user_id', user.id)
		if (homebrewEncounters.error) throw new Error(homebrewEncounters.error.message, { cause: homebrewEncounters.error })

		return {
			compendium: compendiumEncounters.data,
			homebrew: homebrewEncounters.data
				.filter(encounter => encounter.mapInfo.mapCombatTileCount[0]?.count)
				.map(encounter => ({
					encounterId: encounter.encounterId,
					encounterName: encounter.encounterName
				}))
		}
	})

export const tabletopEncounterListQueryOptions = (campaignId: number) => queryOptions({
	queryKey: ['tabletop', 'encounters', campaignId],
	queryFn: () => encounterListLoader({ data: { campaignId } })
})

export function useTabletopEncounterList() {
	const { campaignId } = getRouteApi('/tabletop/$campaignId/gm/').useLoaderData()
	return useSuspenseQuery(tabletopEncounterListQueryOptions(campaignId))
}

/*
	Heroes
*/

const heroListLoader = createServerFn({ method: 'GET' })
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

const heroLoader = createServerFn({ method: 'GET' })
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

/*
	Enemies
*/

const enemyListLoader = createServerFn({ method: 'GET' })
	.validator(tabletopLoaderSchema)
	.handler(async ({ data: { campaignId } }) => {
		const { supabase } = await requireAccount({ backlink: '/campaigns' })

		const { data, error } = await supabase
			.from('tabletop_characters')
			.select('characterId: character_id')
			.eq('campaign_id', campaignId)
			.eq('character_type', 'ENEMY')
		if (error) throw new Error(error.message, { cause: error })

		console.log(data)

		return data.map(enemy => enemy.characterId)
	})

export const tabletopEnemyListQueryOptions = (campaignId: number) => queryOptions({
	queryKey: ['tabletop', 'enemy-list', campaignId],
	queryFn: () => enemyListLoader({ data: { campaignId } })
})

export function useTabletopEnemyList() {
	const { campaignId } = getRouteApi('/tabletop/$campaignId/gm/').useLoaderData()
	return useSuspenseQuery(tabletopEnemyListQueryOptions(campaignId))
}

const enemyLoaderSchema = type({
	characterId: 'number'
})

const enemyLoader = createServerFn({ method: 'GET' })
	.validator(enemyLoaderSchema)
	.handler(async ({ data: { characterId } }) => {
		const { supabase } = await requireAccount({ backlink: '/campaigns' })

		const { data, error } = await supabase
			.from('tabletop_characters')
			.select(`
				tabletopEnemy: tabletop_enemy (
					enemyId: enemy_id,
					enemyInfo: enemy_info (
						enemyName: enemy_name
					)
				)
			`)
			.eq('character_id', characterId)
			.limit(1)
			.single()
		if (error) throw new Error(error.message, { cause: error })

		return {
			tabletopCharacter: characterId,
			data
		}
	})

const tabletopEnemyQueryOptions = (campaignId: number, characterId: number) => queryOptions({
	queryKey: ['tabletop', 'enemy', campaignId, characterId],
	queryFn: () => enemyLoader({ data: { characterId } })
})

export function useTabletopEnemies() {
	const { campaignId } = getRouteApi('/tabletop/$campaignId/gm/').useLoaderData()
	const characterIds = useTabletopEnemyList().data
	const queries = useSuspenseQueries({
		queries: characterIds.map(characterIds => tabletopEnemyQueryOptions(campaignId, characterIds))
	})

	const combine = typedObject.fromEntries(queries.map(enemy => [
		enemy.data.tabletopCharacter,
		enemy.data
	]))

	return {
		data: combine,
		queries
	}
}
