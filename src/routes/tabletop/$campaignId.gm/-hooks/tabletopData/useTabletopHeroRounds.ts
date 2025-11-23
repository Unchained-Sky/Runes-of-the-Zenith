import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { type } from 'arktype'
import { requireGM } from '~/supabase/requireGM'

const heroRoundsSchema = type({
	campaignId: 'number'
})

const heroRoundsLoader = createServerFn({ method: 'GET' })
	.validator(heroRoundsSchema)
	.handler(async ({ data: { campaignId } }) => {
		const { supabase } = await requireGM({ campaignId })

		const { data, error } = await supabase
			.from('tabletop_hero_turn')
			.select(`
				tabletopCharacterId: tt_character_id,
				turnType: turn_type,
				used,
				order,
				tabletop_characters ()
			`)
			.eq('tabletop_characters.campaign_id', campaignId)
			.order('order', { ascending: true })
			// If the select above is changed, the overrideTypes below will need to be updated
			.overrideTypes<HeroTurn[], { merge: false }>()
		if (error) throw new Error(error.message, { cause: error })

		return data
	})

export const tabletopHeroRoundsQueryOptions = (campaignId: number) => queryOptions({
	queryKey: [campaignId, 'tabletop', 'hero-rounds'],
	queryFn: () => heroRoundsLoader({ data: { campaignId } })
})

export function useTabletopHeroRounds() {
	const { campaignId } = getRouteApi('/tabletop/$campaignId/gm/').useLoaderData()
	return useSuspenseQuery(tabletopHeroRoundsQueryOptions(campaignId))
}

type HeroTurn = UsedHeroTurn | UnusedHeroTurn

type HeroTurnFallback = {
	tabletopCharacterId: number
	turnType: 'PRIMARY' | 'SECONDARY'
	used: boolean
	order: number | null
}

interface UsedHeroTurn extends HeroTurnFallback {
	used: true
	order: number
}

interface UnusedHeroTurn extends HeroTurnFallback {
	used: false
	order: null
}
