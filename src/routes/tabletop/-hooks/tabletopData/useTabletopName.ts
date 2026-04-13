import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { type } from 'arktype'
import { useTabletopContext } from '~/routes/tabletop/-utils/TabletopContext'
import { requireAccount } from '~/supabase/requireAccount'

const nameLoaderSchema = type({
	campaignId: 'number'
})

const nameLoader = createServerFn({ method: 'GET' })
	.inputValidator(nameLoaderSchema)
	.handler(async ({ data: { campaignId } }) => {
		const { supabase } = await requireAccount({ backlink: '/campaigns' })

		const { data, error } = await supabase
			.from('campaign_info')
			.select('campaignName: campaign_name')
			.eq('campaign_id', campaignId)
			.limit(1)
			.single()
		if (error) throw new Error(error.message, { cause: error })

		return data.campaignName
	})

export const tabletopNameQueryOptions = (campaignId: number) => queryOptions({
	queryKey: [campaignId, 'tabletop', 'name'],
	queryFn: () => nameLoader({ data: { campaignId } }),
	staleTime: Infinity
})

export function useTabletopName() {
	const { campaignId } = useTabletopContext()
	return useSuspenseQuery(tabletopNameQueryOptions(campaignId))
}
