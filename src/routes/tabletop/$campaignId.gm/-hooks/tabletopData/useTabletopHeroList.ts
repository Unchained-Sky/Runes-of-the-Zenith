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
			.select(`
				heroId: hero_id,
				heroName: hero_name,
				tabletopHero: tabletop_heroes (
					tabletopCharacterId: tt_character_id
				)
			`)
			.eq('campaign_id', campaignId)
		if (error) throw new Error(error.message, { cause: error })

		return data.map(hero => ({
			heroId: hero.heroId,
			heroName: hero.heroName,
			tabletopCharacterId: hero.tabletopHero?.tabletopCharacterId ?? null
		}))
	})

export type TabletopHeroesList = Awaited<ReturnType<typeof heroListLoader>>

export const tabletopHeroListQueryOptions = (campaignId: number) => queryOptions({
	queryKey: [campaignId, 'tabletop', 'hero-list'],
	queryFn: () => heroListLoader({ data: { campaignId } }),
	staleTime: Infinity
})

export function useTabletopHeroList() {
	const { campaignId } = getRouteApi('/tabletop/$campaignId/gm/').useLoaderData()
	return useSuspenseQuery(tabletopHeroListQueryOptions(campaignId))
}
