import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { type } from 'arktype'
import { requireAccount } from '~/supabase/requireAccount'

const heroListLoaderSchema = type({
	campaignId: 'number'
})

const heroListLoader = createServerFn({ method: 'GET' })
	.validator(heroListLoaderSchema)
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
	queryKey: [campaignId, 'tabletop', 'hero-list'],
	queryFn: () => heroListLoader({ data: { campaignId } }),
	staleTime: Infinity
})

export function useTabletopHeroList() {
	const { campaignId } = getRouteApi('/tabletop/$campaignId/gm/').useLoaderData()
	return useSuspenseQuery(tabletopHeroListQueryOptions(campaignId))
}
