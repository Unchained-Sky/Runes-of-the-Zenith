import { queryOptions, useSuspenseQueries } from '@tanstack/react-query'
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
						enemyName: enemy_name
					)
				)
			`)
			.eq('tt_character_id', tabletopCharacterId)
			.limit(1)
			.single()
		if (error) throw new Error(error.message, { cause: error })

		const { tabletopEnemy } = data
		if (!tabletopEnemy) throw new Error('Tabletop enemy not found')

		return {
			tabletopCharacterId,
			tabletopEnemy
		}
	})

const tabletopEnemyQueryOptions = (campaignId: number, tabletopCharacterId: number) => queryOptions({
	queryKey: [campaignId, 'tabletop', 'enemy', tabletopCharacterId],
	queryFn: () => enemyLoader({ data: { tabletopCharacterId } })
})

type EnemiesData = {
	[tabletopCharacterId: number]: Awaited<ReturnType<typeof enemyLoader>>
}

export function useTabletopEnemies() {
	const { campaignId } = getRouteApi('/tabletop/$campaignId/gm/').useLoaderData()
	const { data: tabletopCharacterIds } = useTabletopEnemyList()
	const queries = useSuspenseQueries({
		queries: tabletopCharacterIds.map(tabletopCharacterId => tabletopEnemyQueryOptions(campaignId, tabletopCharacterId))
	})

	const combine: EnemiesData = typedObject.fromEntries(queries.map(enemy => [enemy.data.tabletopCharacterId, enemy.data]))

	return {
		data: combine,
		queries
	}
}
