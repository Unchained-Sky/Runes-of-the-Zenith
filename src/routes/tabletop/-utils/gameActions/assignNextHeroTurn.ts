import { useMutation } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { type } from 'arktype'
import { useTabletopContext } from '~/routes/tabletop/-utils/TabletopContext'
import { type TablesUpdate } from '~/supabase/databaseTypes'
import { getServiceClient } from '~/supabase/getServiceClient'
import { type TabletopHeroData } from '~/tt/-hooks/tabletopData/useTabletopHeroes'
import { type HeroTurn } from '~/tt/-hooks/tabletopData/useTabletopHeroRounds'
import { mutationError } from '~/utils/mutationError'
import { hasCharacterPermission } from '../characterPermission'
import { increaseAggressionQuerySync, UNSAFE_increaseAggressionAction } from './increaseAggression'

const findNextOrder = (array: { order: number | null }[]) => Math.max(0, ...array.flatMap(({ order }) => order ? [order] : [])) + 1

export function useAssignNextHeroTurn() {
	const { queryClient, campaignId } = useTabletopContext()

	return useMutation({
		mutationFn: assignNextHeroTurnAction,
		onMutate: ({ data }) => {
			let nextTurn: number = 0

			void queryClient.cancelQueries({ queryKey: [campaignId, 'tabletop', 'hero-rounds'] })
			queryClient.setQueryData([campaignId, 'tabletop', 'hero-rounds'], (oldData: HeroTurn[]) => {
				const oldDataCopy = structuredClone(oldData)
				const turn = oldDataCopy.findIndex(turn => turn.tabletopCharacterId === data.tabletopCharacterId && turn.turnType === data.turnType)
				if (turn === -1 || !oldDataCopy[turn]) throw new Error('Turn not found')
				nextTurn = findNextOrder(oldDataCopy)
				oldDataCopy[turn].used = true
				oldDataCopy[turn].order = nextTurn
				return oldDataCopy.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
			})

			void queryClient.cancelQueries({ queryKey: [campaignId, 'tabletop', 'hero', data.tabletopCharacterId] })
			queryClient.setQueriesData({ queryKey: [campaignId, 'tabletop', 'hero', data.tabletopCharacterId] }, (oldData: TabletopHeroData) => {
				const { turn } = oldData
				if (!turn) throw new Error('Turn not found')
				return {
					...oldData,
					turn: {
						...turn,
						[data.turnType]: {
							...turn[data.turnType],
							used: true
						}
					}
				} satisfies TabletopHeroData
			})

			increaseAggressionQuerySync({ queryClient, campaignId })
		},
		onError: error => {
			mutationError(error, 'Failed to assign next hero turn')
		}
	})
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
				tabletop_characters ()
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
			if (error) throw new Error(error.message, { cause: error })
		}

		await UNSAFE_increaseAggressionAction({ data: { campaignId } })
	})
