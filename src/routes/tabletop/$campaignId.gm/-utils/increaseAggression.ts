import { type QueryClient, useMutation } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { type } from 'arktype'
import { getServiceClient } from '~/supabase/getServiceClient'
import { requireGM } from '~/supabase/requireGM'
import { type TabletopEnemyData } from '~/tt-gm/-hooks/tabletopData/useTabletopEnemies'
import { useTabletopContext } from '~/tt/-context/TabletopContext'
import { type TabletopEnemyList } from '~/tt/-hooks/tabletopData/useTabletopEnemyList'
import { mutationError } from '~/utils/mutationError'

const DEFAULT_INCREASE_AMOUNT = 1

export function useIncreaseAggression() {
	const { queryClient, campaignId } = useTabletopContext()

	return useMutation({
		mutationFn: increaseAggressionAction,
		onMutate: ({ data }) => {
			if ('tabletopCharacterIds' in data) {
				increaseAggressionQuerySync({ queryClient, amount: data.amount, campaignId, tabletopCharacterIds: data.tabletopCharacterIds })
			} else {
				increaseAggressionQuerySync({ queryClient, amount: data.amount, campaignId })
			}
		},
		onError: error => {
			mutationError(error, 'Failed to increase aggression')
		}
	})
}

type IncreaseAggressionQuerySyncProps = {
	queryClient: QueryClient
	amount?: number
	campaignId: number
	tabletopCharacterIds?: number[]
}

export const increaseAggressionQuerySync = ({ queryClient, amount, campaignId, tabletopCharacterIds }: IncreaseAggressionQuerySyncProps) => {
	const syncCharacter = (tabletopCharacterId: number) => {
		void queryClient.cancelQueries({ queryKey: [campaignId, 'tabletop', 'enemy', tabletopCharacterId] })
		queryClient.setQueryData([campaignId, 'tabletop', 'enemy', tabletopCharacterId], (oldData: TabletopEnemyData) => {
			return {
				...oldData,
				tabletopStats: {
					...oldData.tabletopStats,
					currentAggression: oldData.tabletopStats.currentAggression + (amount ?? DEFAULT_INCREASE_AMOUNT)
				}
			} satisfies TabletopEnemyData
		})
	}

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
