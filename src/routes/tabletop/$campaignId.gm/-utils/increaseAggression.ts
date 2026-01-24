import { useMutation } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { type } from 'arktype'
import { getServiceClient } from '~/supabase/getServiceClient'
import { requireGM } from '~/supabase/requireGM'
import { mutationError } from '~/utils/mutationError'
import { type TabletopEnemyData } from '../-hooks/tabletopData/useTabletopEnemies'

export function useIncreaseAggression() {
	const routeApi = getRouteApi('/tabletop/$campaignId/gm/')
	const { queryClient } = routeApi.useRouteContext()
	const { campaignId } = routeApi.useLoaderData()

	return useMutation({
		mutationFn: increaseAggressionAction,
		onMutate: ({ data }) => {
			void queryClient.cancelQueries({ queryKey: [campaignId, 'tabletop', 'enemy', data.tabletopCharacterId] })
			queryClient.setQueryData([campaignId, 'tabletop', 'enemy', data.tabletopCharacterId], (oldData: TabletopEnemyData) => {
				return {
					...oldData,
					tabletopStats: {
						...oldData.tabletopStats,
						currentAggression: oldData.tabletopStats.currentAggression + (data.amount ?? 1)
					}
				} satisfies TabletopEnemyData
			})
		},
		onError: error => {
			mutationError(error, 'Failed to increase aggression')
		}
	})
}

const increaseAggressionSchema = type({
	'tabletopCharacterId': 'number',
	'amount?': 'number'
})

export const increaseAggressionAction = createServerFn({ method: 'POST' })
	.inputValidator(increaseAggressionSchema)
	.handler(async ({ data: { tabletopCharacterId, amount } }) => {
		const { supabase } = await requireGM({ tabletopCharacterId })

		const { data, error } = await supabase
			.from('tabletop_enemy')
			.select(`
				currentAggression: current_aggression
			`)
			.eq('tt_character_id', tabletopCharacterId)
			.limit(1)
			.single()
		if (error) throw new Error(error.message, { cause: error })

		const serviceClient = getServiceClient()

		{
			const { error } = await serviceClient
				.from('tabletop_enemy')
				.update({
					current_aggression: data.currentAggression + (amount ?? 1)
				})
				.eq('tt_character_id', tabletopCharacterId)
			if (error) throw new Error(error.message, { cause: error })
		}
	})
