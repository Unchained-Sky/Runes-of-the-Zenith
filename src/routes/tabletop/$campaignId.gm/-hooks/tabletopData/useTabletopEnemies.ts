import { queryOptions, useQueries } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { type } from 'arktype'
import { requireAccount } from '~/supabase/requireAccount'
import { typedObject } from '~/types/typedObject'
import { TABLETOP_QUERY_STALE_TIME } from '../../../-hooks/tabletopData/tabletopDataOptions'
import { useGMTabletopEnemyList } from '../../../-hooks/tabletopData/useTabletopEnemyList'

const enemyLoaderSchema = type({
	tabletopCharacterId: 'number'
})

const enemyLoader = createServerFn({ method: 'GET' })
	.inputValidator(enemyLoaderSchema)
	.handler(async ({ data: { tabletopCharacterId } }) => {
		const { supabase } = await requireAccount({ backlink: '/campaigns' })

		const { data, error } = await supabase
			.from('tabletop_characters')
			.select(`
				tabletopEnemy: tabletop_enemy (
					enemyId: enemy_id,
					enemyInfo: enemy_info (
						enemyName: enemy_name,
						characterInfo: character_info (
							maxHealth: max_health,
							maxShield: max_shield,
							int,
							str,
							dex,
							maxMovement: max_movement,
							critChance: crit_chance
						),
						aggression
					),
					currentAggression: current_aggression
				),

				tile: tabletop_tiles (
					q,
					r,
					s
				),
				health,
				wounds,
				shield,
				trauma,
				movement,
				token: tabletop_character_token (
					name: token_name,
					amount
				)
			`)
			.eq('tt_character_id', tabletopCharacterId)
			.limit(1)
			.maybeSingle()
		if (error) throw new Error(error.message, { cause: error })
		if (!data) return null

		const { tabletopEnemy } = data
		if (!tabletopEnemy) throw new Error('Tabletop enemy not found')

		return {
			tabletopCharacterId,
			enemyId: tabletopEnemy.enemyId,
			enemyName: tabletopEnemy.enemyInfo.enemyName,
			stats: {
				maxHealth: tabletopEnemy.enemyInfo.characterInfo.maxHealth,
				maxShield: tabletopEnemy.enemyInfo.characterInfo.maxShield,
				int: tabletopEnemy.enemyInfo.characterInfo.int,
				str: tabletopEnemy.enemyInfo.characterInfo.str,
				dex: tabletopEnemy.enemyInfo.characterInfo.dex,
				maxMovement: tabletopEnemy.enemyInfo.characterInfo.maxMovement,
				critChance: tabletopEnemy.enemyInfo.characterInfo.critChance,
				aggression: tabletopEnemy.enemyInfo.aggression
			},
			tabletopStats: {
				health: data.health,
				wounds: data.wounds,
				shield: data.shield,
				trauma: data.trauma,
				movement: data.movement,
				currentAggression: tabletopEnemy.currentAggression
			},
			pos: data.tile[0] ? [data.tile[0].q, data.tile[0].r, data.tile[0].s] : null,
			tokens: data.token
		}
	})

const tabletopEnemyQueryOptions = (campaignId: number, tabletopCharacterId: number) => queryOptions({
	queryKey: [campaignId, 'tabletop', 'enemy', tabletopCharacterId],
	queryFn: () => enemyLoader({ data: { tabletopCharacterId } }),
	staleTime: TABLETOP_QUERY_STALE_TIME
})

export type TabletopEnemyData = NonNullable<Awaited<ReturnType<typeof enemyLoader>>>
type TabletopEnemiesData = {
	[tabletopCharacterId: number]: TabletopEnemyData
}

export function useGMTabletopEnemies() {
	const { campaignId } = getRouteApi('/tabletop/$campaignId/gm/').useLoaderData()
	const { data: tabletopCharacterIds } = useGMTabletopEnemyList()
	const queries = useQueries({
		queries: tabletopCharacterIds.map(tabletopCharacterId => tabletopEnemyQueryOptions(campaignId, tabletopCharacterId))
	})

	const dataTuple = queries
		.map<[number, TabletopEnemiesData[number]] | null>(enemy => enemy.data ? [enemy.data.tabletopCharacterId, enemy.data] : null)
		.filter(enemy => enemy !== null)
	const combine: TabletopEnemiesData = typedObject.fromEntries(dataTuple)

	return {
		data: combine,
		queries
	}
}
