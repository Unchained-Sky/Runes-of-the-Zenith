import { Button, Group, Stack, Text, Title } from '@mantine/core'
import { useMutation } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { type } from 'arktype'
import { getServiceClient } from '~/supabase/getServiceClient'
import { requireGM } from '~/supabase/requireGM'
import { mutationError } from '~/utils/mutationError'
import { type TabletopEnemyData, useTabletopEnemies } from '../../../-hooks/tabletopData/useTabletopEnemies'
import { useQuerySync } from '../../../-hooks/useQuerySync'
import { useIncreaseAggression } from '../../../-utils/increaseAggression'

export default function EnemyAggression() {
	const { queryClient, campaignId } = useQuerySync()

	const { data: enemiesData } = useTabletopEnemies()

	const increaseAggression = useIncreaseAggression()

	const resetAggression = useMutation({
		mutationFn: resetAggressionAction,
		onMutate: ({ data }) => {
			void queryClient.cancelQueries({ queryKey: [campaignId, 'tabletop', 'enemy', data.tabletopCharacterId] })
			queryClient.setQueryData([campaignId, 'tabletop', 'enemy', data.tabletopCharacterId], (oldData: TabletopEnemyData) => {
				return {
					...oldData,
					tabletopStats: {
						...oldData.tabletopStats,
						currentAggression: 0
					}
				} satisfies TabletopEnemyData
			})
		},
		onError: error => {
			mutationError(error, 'Failed to reset aggression')
		}
	})

	return (
		<Stack>
			<Title order={3}>Enemy Aggression</Title>
			{Object.values(enemiesData).map(enemyData => {
				return (
					<Group key={enemyData.tabletopCharacterId}>
						<Title order={4}>{enemyData.enemyName}</Title>
						<Text>Aggression: {enemyData.tabletopStats.currentAggression} / {enemyData.stats.aggression}</Text>
						<Button
							size='compact-md'
							onClick={() => increaseAggression.mutate({ data: { tabletopCharacterIds: [enemyData.tabletopCharacterId] } })}
						>
							Increase
						</Button>
						<Button
							size='compact-md'
							onClick={() => resetAggression.mutate({ data: { tabletopCharacterId: enemyData.tabletopCharacterId } })}
						>
							Reset
						</Button>
					</Group>
				)
			})}
		</Stack>
	)
}

const resetAggressionSchema = type({
	tabletopCharacterId: 'number'
})

const resetAggressionAction = createServerFn({ method: 'POST' })
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
