import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { type } from 'arktype'
import { useTabletopContext } from '~/routes/tabletop/-utils/TabletopContext'
import { requireAccount } from '~/supabase/requireAccount'
import { TABLETOP_QUERY_STALE_TIME } from './tabletopDataOptions'

const heroRoundsLoaderSchema = type({
	campaignId: 'number'
})

const heroRoundsLoader = createServerFn({ method: 'GET' })
	.inputValidator(heroRoundsLoaderSchema)
	.handler(async ({ data: { campaignId } }) => {
		const { supabase } = await requireAccount()

		const { data, error } = await supabase
			.from('tabletop_hero_turn')
			.select(`
				tabletopCharacterId: tt_character_id,
				turnType: turn_type,
				used,
				order,
				tabletop_characters!inner ()
			`)
			.eq('tabletop_characters.campaign_id', campaignId)
			.order('order', { ascending: true })
			// If the select above is changed, the overrideTypes below will need to be updated
			.overrideTypes<HeroTurn[], { merge: false }>()
		if (error) throw new Error(error.message, { cause: error })

		return data
	})

export type HeroTurn = UsedHeroTurn | UnusedHeroTurn

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

export const tabletopHeroRoundsQueryOptions = (campaignId: number) => queryOptions({
	queryKey: [campaignId, 'tabletop', 'hero-rounds'],
	queryFn: () => heroRoundsLoader({ data: { campaignId } }),
	staleTime: TABLETOP_QUERY_STALE_TIME
})

export function useTabletopHeroRounds() {
	const { campaignId } = useTabletopContext()
	return useSuspenseQuery(tabletopHeroRoundsQueryOptions(campaignId))
}
