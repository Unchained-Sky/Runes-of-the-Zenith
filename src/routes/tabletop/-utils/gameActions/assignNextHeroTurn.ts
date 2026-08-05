import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { type } from 'arktype'
import { type TablesUpdate } from '~/supabase/databaseTypes'
import { getServiceClient } from '~/supabase/getServiceClient'
import { type TabletopHeroData } from '~/tt/-hooks/tabletopData/useTabletopHeroes'
import { mutationError } from '~/utils/mutationError'
import { useTabletopEnvironmentStore } from '../../-hooks/useTabletopEnvironmentStore'
import { hasCharacterPermission } from '../characterPermission'
import getQueryKey from '../getQueryKey'
import { type QuerySyncProps } from './querySync'
import { UNSAFE_updateAggressionAction, updateAggressionQuerySync } from './updateAggression'

const findNextOrder = (array: { order: number | null }[]) => Math.max(0, ...array.flatMap(({ order }) => order ? [order] : [])) + 1

export function useAssignNextHeroTurn() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: assignNextHeroTurnAction,
		onMutate: ({ data }) => {
			assignNextHeroTurnQuerySync({ queryClient, data })
		},
		onError: error => {
			mutationError(error, 'Failed to assign next hero turn')
		}
	})
}

type AssignNextTurnQuerySyncProps = QuerySyncProps<typeof assignNextHeroTurnSchema>

export function assignNextHeroTurnQuerySync({ queryClient, data }: AssignNextTurnQuerySyncProps) {
	const queryKey = getQueryKey({ type: 'hero', data: { tabletopCharacterId: data.tabletopCharacterId } })
	void queryClient.cancelQueries({ queryKey })

	const heroesQueryKey = getQueryKey({ type: 'hero', data: { tabletopCharacterId: null } })
	const heroesTurns = queryClient.getQueriesData<TabletopHeroData>({ queryKey: heroesQueryKey })
		.flatMap(([_, heroData]) => heroData ?? [])
		.flatMap(heroData => [heroData.turn['PRIMARY'], heroData.turn['SECONDARY']])
	const nextTurn = findNextOrder(heroesTurns)

	queryClient.setQueriesData({ queryKey }, (oldData: TabletopHeroData) => {
		const { turn } = oldData
		return {
			...oldData,
			turn: {
				...turn,
				[data.turnType]: {
					...turn[data.turnType],
					order: nextTurn,
					used: true
				}
			}
		} satisfies TabletopHeroData
	})

	const { campaignId } = useTabletopEnvironmentStore.getState()
	updateAggressionQuerySync({ queryClient, data: { target: { campaignId }, amount: { relative: -1 } } })
}

const assignNextHeroTurnSchema = type({
	tabletopCharacterId: 'number',
	turnType: '"PRIMARY" | "SECONDARY"'
})

export const assignNextHeroTurnAction = createServerFn({ method: 'POST' })
	.inputValidator(assignNextHeroTurnSchema)
	.handler(async ({ data: { tabletopCharacterId, turnType } }) => {
		const { supabase, campaignId } = await hasCharacterPermission({ tabletopCharacterId })

		const { data, error } = await supabase
			.from('tabletop_hero_turn')
			.select(`
				order,
				tabletop_characters!inner()
			`)
			.eq('tabletop_characters.campaign_id', campaignId)
		if (error) throw new Error(error.message, { cause: error })

		const nextOrder = findNextOrder(data)

		const serviceClient = getServiceClient()

		{
			const { error } = await serviceClient
				.from('tabletop_hero_turn')
				.update({
					used: true,
					order: nextOrder
				} satisfies TablesUpdate<'tabletop_hero_turn'>)
				.eq('tt_character_id', tabletopCharacterId)
				.eq('turn_type', turnType)
			console.log(error)
			if (error) throw new Error(error.message, { cause: error })
		}

		await UNSAFE_updateAggressionAction({
			target: { campaignId: campaignId },
			amount: { relative: -1 }
		})
	})
