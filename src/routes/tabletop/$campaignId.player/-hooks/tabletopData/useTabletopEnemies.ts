import { queryOptions, useQueries } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { type } from 'arktype'
import { TABLETOP_QUERY_STALE_TIME } from '~/routes/tabletop/-hooks/tabletopData/tabletopDataOptions'
import { useTabletopEnemyList } from '~/routes/tabletop/-hooks/tabletopData/useTabletopEnemyList'
import { useTabletopContext } from '~/routes/tabletop/-utils/TabletopContext'
import { requireAccount } from '~/supabase/requireAccount'
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
						enemyName: enemy_name
					),
					currentAggression: current_aggression
				),

				tile: tabletop_tiles (
					q,
					r,
					s
				),
				token: tabletop_character_token (
					name: token_name,
					amount
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

		return {
			tabletopCharacterId,
			enemyId: tabletopEnemy.enemyId,
			enemyName: tabletopEnemy.enemyInfo.enemyName,
			tabletopStats: {
				currentAggression: tabletopEnemy.currentAggression
			},
			pos: data.tile[0] ? [data.tile[0].q, data.tile[0].r, data.tile[0].s] : null,
			tokens: data.token
		}
	})

const tabletopEnemyQueryOptions = (campaignId: number, tabletopCharacterId: number) => queryOptions({
	queryKey: [campaignId, 'tabletop-player', 'enemy', tabletopCharacterId],
	queryFn: () => enemyLoader({ data: { tabletopCharacterId } }),
	staleTime: TABLETOP_QUERY_STALE_TIME
})

export type TabletopPlayerEnemyData = NonNullable<Awaited<ReturnType<typeof enemyLoader>>>
type TabletopPlayerEnemiesData = {
	[tabletopCharacterId: number]: TabletopPlayerEnemyData
}

export function usePlayerTabletopEnemies() {
	const { campaignId } = useTabletopContext()
	const { data: tabletopCharacterIds } = useTabletopEnemyList()
	const queries = useQueries({
		queries: tabletopCharacterIds.map(tabletopCharacterId => tabletopEnemyQueryOptions(campaignId, tabletopCharacterId))
	})

	const dataTuple = queries
		.map<[number, TabletopPlayerEnemiesData[number]] | null>(enemy => enemy.data ? [enemy.data.tabletopCharacterId, enemy.data] : null)
		.filter(enemy => enemy !== null)
	const combine: TabletopPlayerEnemiesData = typedObject.fromEntries(dataTuple)

	return {
		data: combine,
		queries
	}
}
