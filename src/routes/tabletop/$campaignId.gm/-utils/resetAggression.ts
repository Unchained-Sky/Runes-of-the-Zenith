import { type QueryClient, useMutation } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { type } from 'arktype'
import { getServiceClient } from '~/supabase/getServiceClient'
import { requireGM } from '~/supabase/requireGM'
import { mutationError } from '~/utils/mutationError'
import { type TabletopEnemyData } from '../-hooks/tabletopData/useTabletopEnemies'
import { useQuerySync } from '../-hooks/useQuerySync'

export function useResetAggression() {
	const { queryClient, campaignId } = useQuerySync()

	return useMutation({
		mutationFn: resetAggressionAction,
		onMutate: ({ data }) => {
			resetAggressionQuerySync({
				queryClient,
				campaignId,
				tabletopCharacterId: data.tabletopCharacterId
			})
		},
		onError: error => {
			mutationError(error, 'Failed to reset aggression')
		}
	})
}

type ResetAggressionQuerySyncProps = {
	queryClient: QueryClient
	campaignId: number
	tabletopCharacterId: number
}

export const resetAggressionQuerySync = ({ queryClient, campaignId, tabletopCharacterId }: ResetAggressionQuerySyncProps) => {
	void queryClient.cancelQueries({ queryKey: [campaignId, 'tabletop', 'enemy', tabletopCharacterId] })
	queryClient.setQueryData([campaignId, 'tabletop', 'enemy', tabletopCharacterId], (oldData: TabletopEnemyData) => {
		return {
			...oldData,
			tabletopStats: {
				...oldData.tabletopStats,
				currentAggression: 0
			}
		} satisfies TabletopEnemyData
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
