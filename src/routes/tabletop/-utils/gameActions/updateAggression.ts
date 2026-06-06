import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createServerFn, createServerOnlyFn } from '@tanstack/react-start'
import { type } from 'arktype'
import { type TablesUpdate } from '~/supabase/databaseTypes'
import { getServiceClient } from '~/supabase/getServiceClient'
import { requireGM } from '~/supabase/requireGM'
import { mutationError } from '~/utils/mutationError'
import { type TabletopGMEnemyData } from '../../$campaignId.gm/-hooks/tabletopData/useGMTabletopEnemies'
import { type TabletopPlayerEnemyData } from '../../$campaignId.player/-hooks/tabletopData/usePlayerTabletopEnemies'
import { type TabletopEnemyList } from '../../-hooks/tabletopData/useTabletopEnemyList'
import getQueryKey from '../getQueryKey'
import { type QuerySyncProps } from './querySync'

export function useUpdateAggression() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: updateAggressionAction,
		onMutate: ({ data }) => {
			updateAggressionQuerySync({ queryClient, data })
		},
		onError: error => {
			mutationError(error, 'Failed to update aggression')
		}
	})
}

type UpdateAggressionQuerySyncProps = QuerySyncProps<typeof updateAggressionSchema>

export const updateAggressionQuerySync = ({ queryClient, data }: UpdateAggressionQuerySyncProps) => {
	const getTargets = () => {
		if ('tabletopCharacterIds' in data.target) return data.target.tabletopCharacterIds

		const queryKey = getQueryKey({ type: 'enemy-list' })
		return queryClient.getQueryData<TabletopEnemyList>(queryKey) ?? [0]
	}

	const syncCharacter = (tabletopCharacterId: number) => {
		const queryKey = getQueryKey({ type: 'enemy', data: { tabletopCharacterId } })
		void queryClient.cancelQueries({ queryKey })
		queryClient.setQueryData(queryKey, (oldData: TabletopGMEnemyData | TabletopPlayerEnemyData) => {
			const updatedAggression = 'relative' in data.amount
				? Math.max(0, oldData.tabletopStats.currentAggression + data.amount.relative)
				: data.amount.absolute
			return {
				...oldData,
				tabletopStats: {
					...oldData.tabletopStats,
					currentAggression: updatedAggression
				}
			} satisfies TabletopGMEnemyData | TabletopPlayerEnemyData
		})
	}

	const targets = getTargets()
	for (const tabletopCharacterId of targets) {
		syncCharacter(tabletopCharacterId)
	}
}

const updateAggressionSchema = type({
	target: type(
		{
			tabletopCharacterIds: 'number[]'
		},
		'|',
		{
			campaignId: 'number'
		}
	),
	amount: type(
		{
			relative: 'number'
		},
		'|',
		{
			absolute: 'number'
		}
	)
})

const updateAggressionAction = createServerFn({ method: 'POST' })
	.inputValidator(updateAggressionSchema)
	.handler(async ({ data: { target, amount } }) => {
		if ('tabletopCharacterIds' in target) {
			await requireGM({ tabletopCharacterId: target.tabletopCharacterIds[0] ?? -1 })
		} else {
			await requireGM({ campaignId: target.campaignId })
		}

		await UNSAFE_updateAggressionAction({ target, amount })
	})

export const UNSAFE_updateAggressionAction = createServerOnlyFn(async ({ target, amount }: typeof updateAggressionSchema.infer) => {
	const serviceClient = getServiceClient()

	const getTargets = async () => {
		if ('tabletopCharacterIds' in target) return target.tabletopCharacterIds

		const { data, error } = await serviceClient
			.from('tabletop_characters')
			.select('tabletopCharacterId: tt_character_id')
			.eq('campaign_id', target.campaignId)
			.eq('character_type', 'ENEMY')
		if (error) throw new Error(error.message, { cause: error })

		return data.map(character => character.tabletopCharacterId)
	}

	const targets = await getTargets()

	if ('absolute' in amount) {
		const { error } = await serviceClient
			.from('tabletop_enemy')
			.update({
				current_aggression: amount.absolute
			} satisfies TablesUpdate<'tabletop_enemy'>)
			.in('tt_character_id', targets)
		if (error) throw new Error(error.message, { cause: error })
	} else {
		for (const tabletopCharacterId of targets) {
			const { data, error } = await serviceClient
				.from('tabletop_enemy')
				.select('current_aggression')
				.eq('tt_character_id', tabletopCharacterId)
				.limit(1)
				.single()
			if (error) throw new Error(error.message, { cause: error })

			const { error: updateError } = await serviceClient
				.from('tabletop_enemy')
				.update({
					current_aggression: Math.max(0, data.current_aggression + amount.relative)
				} satisfies TablesUpdate<'tabletop_enemy'>)
				.eq('tt_character_id', tabletopCharacterId)
			if (updateError) throw new Error(updateError.message, { cause: updateError })
		}
	}
})
