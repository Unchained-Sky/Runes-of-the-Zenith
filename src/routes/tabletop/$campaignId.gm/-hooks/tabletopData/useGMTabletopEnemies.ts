import { queryOptions, useQueries } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { type } from 'arktype'
import { useTabletopEnvironmentStore } from '~/routes/tabletop/-hooks/useTabletopEnvironmentStore'
import { type EnemyRuneData } from '~/scripts/data/enemies/enemyData'
import { enemyRuneExtraDataFormatter } from '~/supabase/extraDataFormatter/enemyRuneExtraData'
import { lingeringDataFormatter } from '~/supabase/extraDataFormatter/lingeringExtraData'
import { requireAccount } from '~/supabase/requireAccount'
import { TABLETOP_QUERY_STALE_TIME } from '~/tt/-hooks/tabletopData/tabletopDataOptions'
import { useTabletopEnemyList } from '~/tt/-hooks/tabletopData/useTabletopEnemyList'
import { typedObject } from '~/types/typedObject'

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
						aggression,
						enemyRune: enemy_rune_info (
							name: rune_name,
							slot,
							data
						)
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
				),
				lingering: tabletop_lingering (
					lingeringId: linger_id,
					decrementTime: decrement_time,
					remainingTime: remaining_time,
					data
				)
			`)
			.eq('tt_character_id', tabletopCharacterId)
			.eq('character_type', 'ENEMY')
			.limit(1)
			.maybeSingle()
		if (error) throw new Error(error.message, { cause: error })
		if (!data) return null

		const { tabletopEnemy } = data
		if (!tabletopEnemy) throw new Error('Tabletop enemy not found')

		const runes = tabletopEnemy.enemyInfo.enemyRune
			.map(enemyRuneExtraDataFormatter)
			.reduce<Record<EnemyRuneData['slot'], EnemyRuneData[]>>((acc, curr) => {
				return {
					...acc,
					[curr.slot]: [
						...acc[curr.slot],
						curr
					]
				}
			}, {
				PRIMARY: [],
				SECONDARY: [],
				PASSIVE: []
			})

		const lingering = data.lingering.map(lingeringDataFormatter)

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
			runes,
			tokens: data.token,
			lingering
		}
	})

const tabletopEnemyQueryOptions = (campaignId: number, tabletopCharacterId: number) => queryOptions({
	queryKey: [campaignId, 'tabletop-gm', 'enemy', tabletopCharacterId],
	queryFn: () => enemyLoader({ data: { tabletopCharacterId } }),
	staleTime: TABLETOP_QUERY_STALE_TIME
})

export type TabletopGMEnemyData = NonNullable<Awaited<ReturnType<typeof enemyLoader>>>
type TabletopGMEnemiesData = {
	[tabletopCharacterId: number]: TabletopGMEnemyData
}

export function useGMTabletopEnemies() {
	const { campaignId, role } = useTabletopEnvironmentStore()
	const { data: tabletopCharacterIds } = useTabletopEnemyList()
	const queries = useQueries({
		queries: tabletopCharacterIds.map(tabletopCharacterId => tabletopEnemyQueryOptions(campaignId, tabletopCharacterId))
	})

	if (role !== 'gm') throw new Error('Role is not GM')

	const dataTuple = queries
		.map<[number, TabletopGMEnemiesData[number]] | null>(enemy => enemy.data ? [enemy.data.tabletopCharacterId, enemy.data] : null)
		.filter(enemy => enemy !== null)
	const combine: TabletopGMEnemiesData = typedObject.fromEntries(dataTuple)

	return {
		data: combine,
		queries
	}
}
