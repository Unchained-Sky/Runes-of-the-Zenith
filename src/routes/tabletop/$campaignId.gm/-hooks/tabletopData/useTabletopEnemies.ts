import { queryOptions, useQueries } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { type } from 'arktype'
import { requireAccount } from '~/supabase/requireAccount'
import { typedObject } from '~/types/typedObject'
import { useTabletopEnemyList } from './useTabletopEnemyList'

const enemyLoaderSchema = type({
	tabletopCharacterId: 'number'
})

const enemyLoader = createServerFn({ method: 'GET' })
	.validator(enemyLoaderSchema)
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
						)
					)
				),
				health,
				wounds,
				shield,
				trauma,
				movement
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
			stats: tabletopEnemy.enemyInfo.characterInfo,
			tabletopStats: {
				health: data.health,
				wounds: data.wounds,
				shield: data.shield,
				trauma: data.trauma,
				movement: data.movement
			}
		}
	})

const tabletopEnemyQueryOptions = (campaignId: number, tabletopCharacterId: number) => queryOptions({
	queryKey: [campaignId, 'tabletop', 'enemy', tabletopCharacterId],
	queryFn: () => enemyLoader({ data: { tabletopCharacterId } })
})

type TabletopEnemyData = NonNullable<Awaited<ReturnType<typeof enemyLoader>>>
type TabletopEnemiesData = {
	[tabletopCharacterId: number]: TabletopEnemyData
}

export function useTabletopEnemies() {
	const { campaignId } = getRouteApi('/tabletop/$campaignId/gm/').useLoaderData()
	const { data: tabletopCharacterIds } = useTabletopEnemyList()
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
