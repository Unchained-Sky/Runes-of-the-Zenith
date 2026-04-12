import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { type } from 'arktype'
import { requireAccount } from '~/supabase/requireAccount'
import { TABLETOP_QUERY_STALE_TIME } from './tabletopDataOptions'

const enemyListLoaderSchema = type({
	campaignId: 'number'
})

const enemyListLoader = createServerFn({ method: 'GET' })
	.inputValidator(enemyListLoaderSchema)
	.handler(async ({ data: { campaignId } }) => {
		const { supabase } = await requireAccount({ backlink: '/campaigns' })

		const { data, error } = await supabase
			.from('tabletop_characters')
			.select('tabletopCharacterId: tt_character_id')
			.eq('campaign_id', campaignId)
			.eq('character_type', 'ENEMY')
		if (error) throw new Error(error.message, { cause: error })

		return data.map(enemy => enemy.tabletopCharacterId)
	})

export type TabletopEnemyList = Awaited<ReturnType<typeof enemyListLoader>>

export const tabletopEnemyListQueryOptions = (campaignId: number) => queryOptions({
	queryKey: [campaignId, 'tabletop', 'enemy-list'],
	queryFn: () => enemyListLoader({ data: { campaignId } }),
	staleTime: TABLETOP_QUERY_STALE_TIME
})

export function useGMTabletopEnemyList() {
	const { campaignId } = getRouteApi('/tabletop/$campaignId/gm/').useLoaderData()
	return useSuspenseQuery(tabletopEnemyListQueryOptions(campaignId))
}

export function usePlayerTabletopEnemyList() {
	const { campaignId } = getRouteApi('/tabletop/$campaignId/player/').useLoaderData()
	return useSuspenseQuery(tabletopEnemyListQueryOptions(campaignId))
}
