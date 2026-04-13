import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { type } from 'arktype'
import { useTabletopContext } from '~/routes/tabletop/-utils/TabletopContext'
import { requireAccount } from '~/supabase/requireAccount'
import { TABLETOP_QUERY_STALE_TIME } from './tabletopDataOptions'

const roundLoaderSchema = type({
	campaignId: 'number'
})

const roundLoader = createServerFn({ method: 'GET' })
	.inputValidator(roundLoaderSchema)
	.handler(async ({ data: { campaignId } }) => {
		const { supabase } = await requireAccount({ backlink: '/campaigns' })

		const { data, error } = await supabase
			.from('tabletop_info')
			.select(`
				round
			`)
			.eq('campaign_id', campaignId)
			.limit(1)
			.maybeSingle()
		if (error) throw new Error(error.message, { cause: error })

		return data ?? { round: 0 }
	})

export type TabletopRoundData = Awaited<ReturnType<typeof roundLoader>>

export const tabletopRoundQueryOptions = (campaignId: number) => queryOptions({
	queryKey: [campaignId, 'tabletop', 'round'],
	queryFn: () => roundLoader({ data: { campaignId } }),
	staleTime: TABLETOP_QUERY_STALE_TIME
})

export function useTabletopRound() {
	const { campaignId } = useTabletopContext()
	return useSuspenseQuery(tabletopRoundQueryOptions(campaignId))
}
