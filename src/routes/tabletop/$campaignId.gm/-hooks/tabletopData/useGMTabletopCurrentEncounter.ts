import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { type } from 'arktype'
import { useTabletopContext } from '~/routes/tabletop/-utils/TabletopContext'
import { requireAccount } from '~/supabase/requireAccount'
import { TABLETOP_QUERY_STALE_TIME } from '~/tt/-hooks/tabletopData/tabletopDataOptions'

const currentEncounterLoaderSchema = type({
	campaignId: 'number'
})

const currentEncounterLoader = createServerFn({ method: 'GET' })
	.inputValidator(currentEncounterLoaderSchema)
	.handler(async ({ data: { campaignId } }) => {
		const { supabase } = await requireAccount({ backlink: '/campaigns' })

		const { data, error } = await supabase
			.from('tabletop_info')
			.select(`
				encounterInfo: encounter_info (
					encounterName: encounter_name
				)
			`)
			.eq('campaign_id', campaignId)
			.limit(1)
			.maybeSingle()
		if (error) throw new Error(error.message, { cause: error })

		return data?.encounterInfo?.encounterName ?? null
	})

export const tabletopCurrentEncounterQueryOptions = (campaignId: number) => queryOptions({
	queryKey: [campaignId, 'tabletop-gm', 'encounter-name'],
	queryFn: () => currentEncounterLoader({ data: { campaignId } }),
	staleTime: TABLETOP_QUERY_STALE_TIME
})

export function useGMTabletopCurrentEncounter() {
	const { campaignId } = useTabletopContext()
	return useSuspenseQuery(tabletopCurrentEncounterQueryOptions(campaignId))
}
