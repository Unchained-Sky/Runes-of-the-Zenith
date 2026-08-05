import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { type } from 'arktype'
import { getServiceClient } from '~/supabase/getServiceClient'
import { characterType } from '~/types/gameTypes/character'
import { mutationError } from '~/utils/mutationError'
import { type TabletopGMEnemyData } from '../../$campaignId.gm/-hooks/tabletopData/useGMTabletopEnemies'
import { type TabletopHeroData } from '../../-hooks/tabletopData/useTabletopHeroes'
import { hasCharacterPermission } from '../characterPermission'
import getQueryKey from '../getQueryKey'
import { type QuerySyncProps } from './querySync'

export function useUpdateCharacterStats() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: updateCharacterAction,
		scope: {
			id: 'tabletop-update-character'
		},
		onMutate: ({ data }) => {
			updateCharacterStatsQuerySync({ queryClient, data })
		},
		onError: error => {
			mutationError(error, 'Failed to update character stats')
		}
	})
}

type UpdateCharacterStatsQuerySyncProps = QuerySyncProps<typeof updateCharacterSchema>

export function updateCharacterStatsQuerySync({ queryClient, data }: UpdateCharacterStatsQuerySyncProps) {
	switch (data.characterType) {
		case 'HERO': {
			const queryKey = getQueryKey({ type: 'hero', data: { tabletopCharacterId: data.tabletopCharacterId } })
			void queryClient.cancelQueries({ queryKey })
			queryClient.setQueriesData({ queryKey }, (oldData: TabletopHeroData) => {
				return {
					...oldData,
					tabletopStats: {
						...oldData.tabletopStats,
						health: data.values.currentHealth,
						wounds: data.values.wounds,
						shield: data.values.currentShield,
						trauma: data.values.trauma,
						movement: data.values.currentMovement
					}
				} satisfies TabletopHeroData
			})
			break
		}
		case 'ENEMY': {
			const queryKey = getQueryKey({ type: 'enemy', data: { tabletopCharacterId: data.tabletopCharacterId } })
			void queryClient.cancelQueries({ queryKey })
			queryClient.setQueriesData({ queryKey }, (oldData: TabletopGMEnemyData) => {
				return {
					...oldData,
					tabletopStats: {
						...oldData.tabletopStats,
						health: data.values.currentHealth,
						wounds: data.values.wounds,
						shield: data.values.currentShield,
						trauma: data.values.trauma,
						movement: data.values.currentMovement
					}
				} satisfies TabletopGMEnemyData
			})
			break
		}
	}
}

const updateCharacterSchema = type({
	tabletopCharacterId: 'number',
	characterType,
	values: {
		currentShield: 'number',
		trauma: 'number',
		currentHealth: 'number',
		wounds: 'number',
		currentMovement: 'number'
	}
})

const updateCharacterAction = createServerFn({ method: 'POST' })
	.inputValidator(updateCharacterSchema)
	.handler(async ({ data: { tabletopCharacterId, values } }) => {
		await hasCharacterPermission({ tabletopCharacterId })

		const { currentShield, trauma, currentHealth, wounds, currentMovement } = values

		const serviceClient = getServiceClient()

		const { error } = await serviceClient
			.from('tabletop_characters')
			.update({
				shield: currentShield,
				trauma,
				health: currentHealth,
				wounds,
				movement: currentMovement
			})
			.eq('tt_character_id', tabletopCharacterId)
		if (error) throw new Error(error.message, { cause: error })
	})
