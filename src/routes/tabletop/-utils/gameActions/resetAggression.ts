import { useMutation } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { type } from 'arktype'
import { type TabletopGMEnemyData } from '~/routes/tabletop/$campaignId.gm/-hooks/tabletopData/useGMTabletopEnemies'
import { useTabletopContext } from '~/routes/tabletop/-utils/TabletopContext'
import { getServiceClient } from '~/supabase/getServiceClient'
import { requireGM } from '~/supabase/requireGM'
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
