import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { type } from 'arktype'
import { type TabletopGMEnemyData } from '~/routes/tabletop/$campaignId.gm/-hooks/tabletopData/useGMTabletopEnemies'
import { getServiceClient } from '~/supabase/getServiceClient'
import { requireGM } from '~/supabase/requireGM'
import { mutationError } from '~/utils/mutationError'
import getQueryKey from '../getQueryKey'
import { type QuerySyncProps } from './querySync'

export function useResetAggression() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: resetAggressionAction,
		onMutate: ({ data }) => {
			resetAggressionQuerySync({ queryClient, data })
		},
		onError: error => {
			mutationError(error, 'Failed to reset aggression')
		}
	})
}

type ResetAggressionQuerySyncProps = QuerySyncProps<typeof resetAggressionSchema>

export function resetAggressionQuerySync({ queryClient, data }: ResetAggressionQuerySyncProps) {
	const queryKey = getQueryKey({ type: 'enemy', data })
	void queryClient.cancelQueries({ queryKey })
	queryClient.setQueryData(queryKey, (oldData: TabletopGMEnemyData) => {
		return {
			...oldData,
			tabletopStats: {
				...oldData.tabletopStats,
				currentAggression: oldData.stats.aggression
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
		const { supabase } = await requireGM({ tabletopCharacterId })

		const { data, error } = await supabase
			.from('enemy_info')
			.select(`
				aggression,
				tabletopEnemy: tabletop_enemy (
					tabletopCharacterId: tt_character_id
				)
			`)
			.eq('tabletop_enemy.tt_character_id', tabletopCharacterId)
			.limit(1)
			.single()
		if (error) throw new Error(error.message, { cause: error })

		const serviceClient = getServiceClient()

		{
			const { error } = await serviceClient
				.from('tabletop_enemy')
				.update({
					current_aggression: data.aggression
				})
				.eq('tt_character_id', tabletopCharacterId)
				.limit(1)
			if (error) throw new Error(error.message, { cause: error })
		}
	})
