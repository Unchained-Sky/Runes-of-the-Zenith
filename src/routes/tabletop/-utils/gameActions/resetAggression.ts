import { useMutation } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { type } from 'arktype'
import { useTabletopContext } from '~/routes/tabletop/-utils/TabletopContext'
import { getServiceClient } from '~/supabase/getServiceClient'
import { requireGM } from '~/supabase/requireGM'
import { type TabletopGMEnemyData } from '~/tt-gm/-hooks/tabletopData/useTabletopEnemies'
import { mutationError } from '~/utils/mutationError'
import { type QuerySyncProps } from './querySync'

export function useResetAggression() {
	const { queryClient, campaignId } = useTabletopContext()

	return useMutation({
		mutationFn: resetAggressionAction,
		onMutate: ({ data }) => {
			resetAggressionQuerySync({ queryClient, campaignId, data })
		},
		onError: error => {
			mutationError(error, 'Failed to reset aggression')
		}
	})
}

type ResetAggressionQuerySyncProps = QuerySyncProps<typeof resetAggressionSchema>

export function resetAggressionQuerySync({ queryClient, campaignId, data }: ResetAggressionQuerySyncProps) {
	void queryClient.cancelQueries({ queryKey: [campaignId, 'tabletop-gm', 'enemy', data.tabletopCharacterId] })
	queryClient.setQueryData([campaignId, 'tabletop-gm', 'enemy', data.tabletopCharacterId], (oldData: TabletopGMEnemyData) => {
		return {
			...oldData,
			tabletopStats: {
				...oldData.tabletopStats,
				currentAggression: 0
			}
		} satisfies TabletopGMEnemyData
	})
}

const resetAggressionSchema = type({
	tabletopCharacterId: 'number'
})

export const resetAggressionAction = createServerFn({ method: 'POST' })
	.inputValidator(resetAggressionSchema)
	.handler(async ({ data: { tabletopCharacterId } }) => {
		await requireGM({ tabletopCharacterId })

		const serviceClient = getServiceClient()

		const { error } = await serviceClient
			.from('tabletop_enemy')
			.update({
				current_aggression: 0
			})
			.eq('tt_character_id', tabletopCharacterId)
		if (error) throw new Error(error.message, { cause: error })
	})
