import { useMutation } from '@tanstack/react-query'
import { createServerFn, createServerOnlyFn } from '@tanstack/react-start'
import { type } from 'arktype'
import { useTabletopContext } from '~/routes/tabletop/-utils/TabletopContext'
import { getServiceClient } from '~/supabase/getServiceClient'
import { requireGM } from '~/supabase/requireGM'
import { type TabletopGMEnemyData } from '~/tt-gm/-hooks/tabletopData/useTabletopEnemies'
import { type TabletopEnemyList } from '~/tt/-hooks/tabletopData/useTabletopEnemyList'
import { mutationError } from '~/utils/mutationError'
import { type QuerySyncProps } from './querySync'

const DEFAULT_INCREASE_AMOUNT = 1

export function useIncreaseAggression() {
	const { queryClient, campaignId } = useTabletopContext()

	return useMutation({
		mutationFn: increaseAggressionAction,
		onMutate: ({ data }) => {
			increaseAggressionQuerySync({ queryClient, campaignId, data })
		},
		onError: error => {
			mutationError(error, 'Failed to increase aggression')
		}
	})
}

type IncreaseAggressionQuerySyncProps = QuerySyncProps<typeof increaseAggressionSchema>

export function increaseAggressionQuerySync({ queryClient, campaignId, data }: IncreaseAggressionQuerySyncProps) {
	const syncCharacter = (tabletopCharacterId: number) => {
		void queryClient.cancelQueries({ queryKey: [campaignId, 'tabletop-gm', 'enemy', tabletopCharacterId] })
		queryClient.setQueryData([campaignId, 'tabletop-gm', 'enemy', tabletopCharacterId], (oldData: TabletopGMEnemyData) => {
			return {
				...oldData,
				tabletopStats: {
					...oldData.tabletopStats,
					currentAggression: oldData.tabletopStats.currentAggression + (data.amount ?? DEFAULT_INCREASE_AMOUNT)
				}
			} satisfies TabletopGMEnemyData
		})
	}

	const tabletopCharacterIds = 'tabletopCharacterIds' in data ? data.tabletopCharacterIds : null

	if (tabletopCharacterIds) {
		for (const tabletopCharacterId of tabletopCharacterIds) {
			syncCharacter(tabletopCharacterId)
		}
	} else {
		const tabletopCharacterIds = queryClient.getQueryData<TabletopEnemyList>([campaignId, 'tabletop', 'enemy-list'])
		for (const tabletopCharacterId of tabletopCharacterIds ?? []) {
			syncCharacter(tabletopCharacterId)
		}
	}
}

const increaseAggressionSchema = type([
	{
		'tabletopCharacterIds': 'number[]',
		'amount?': 'number'
	},
	'|',
	{
		'campaignId': 'number',
		'amount?': 'number'
	}
])

export const increaseAggressionAction = createServerFn({ method: 'POST' })
	.inputValidator(increaseAggressionSchema)
	.handler(async ({ data: { amount, ...props } }) => {
		if ('tabletopCharacterIds' in props) {
			await requireGM({ tabletopCharacterId: props.tabletopCharacterIds[0] ?? -1 })
		} else {
			await requireGM({ campaignId: props.campaignId })
		}

		await UNSAFE_increaseAggressionAction({ amount, ...props })
	})

export const UNSAFE_increaseAggressionAction = createServerOnlyFn(async ({ amount, ...props }: typeof increaseAggressionSchema.t) => {
	const serviceClient = getServiceClient()

	const increaseAggressionFunc = async (tabletopCharacterIds: number[]) => {
		const { data, error } = await serviceClient
			.from('tabletop_enemy')
			.select(`
				tabletopCharacterId: tt_character_id,
				currentAggression: current_aggression
			`)
			.in('tt_character_id', tabletopCharacterIds)
		if (error) throw new Error(error.message, { cause: error })

		for (const { tabletopCharacterId, currentAggression } of data) {
			const { error } = await serviceClient
				.from('tabletop_enemy')
				.update({
					current_aggression: currentAggression + (amount ?? DEFAULT_INCREASE_AMOUNT)
				})
				.eq('tt_character_id', tabletopCharacterId)
			if (error) throw new Error(error.message, { cause: error })
		}
	}

	if ('tabletopCharacterIds' in props) {
		await increaseAggressionFunc(props.tabletopCharacterIds)
	} else {
		const { data, error } = await serviceClient
			.from('tabletop_characters')
			.select('tabletopCharacterId: tt_character_id')
			.eq('campaign_id', props.campaignId)
		if (error) throw new Error(error.message, { cause: error })

		await increaseAggressionFunc(data.map(character => character.tabletopCharacterId))
	}
})
