import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { type } from 'arktype'
import { requireAccount } from '~/supabase/requireAccount'

const enemyListLoaderSchema = type({
	campaignId: 'number'
})

const enemyListLoader = createServerFn({ method: 'GET' })
	.validator(enemyListLoaderSchema)
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

export const tabletopEnemyListQueryOptions = (campaignId: number) => queryOptions({
	queryKey: [campaignId, 'tabletop', 'enemy-list'],
	queryFn: () => enemyListLoader({ data: { campaignId } })
})

export function useTabletopEnemyList() {
	const { campaignId } = getRouteApi('/tabletop/$campaignId/gm/').useLoaderData()
	return useSuspenseQuery(tabletopEnemyListQueryOptions(campaignId))
}
