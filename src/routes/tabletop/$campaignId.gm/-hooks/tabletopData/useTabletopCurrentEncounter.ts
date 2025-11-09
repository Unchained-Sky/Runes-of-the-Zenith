import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { type } from 'arktype'
import { requireAccount } from '~/supabase/requireAccount'

const currentEncounterLoaderSchema = type({
	campaignId: 'number'
})

const currentEncounterLoader = createServerFn({ method: 'GET' })
	.validator(currentEncounterLoaderSchema)
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
	queryKey: [campaignId, 'tabletop', 'encounter-name'],
	queryFn: () => currentEncounterLoader({ data: { campaignId } })
})

export function useTabletopCurrentEncounter() {
	const { campaignId } = getRouteApi('/tabletop/$campaignId/gm/').useLoaderData()
	return useSuspenseQuery(tabletopCurrentEncounterQueryOptions(campaignId))
}
