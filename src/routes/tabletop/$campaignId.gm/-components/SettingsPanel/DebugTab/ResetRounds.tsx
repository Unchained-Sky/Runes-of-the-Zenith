import { Button, Group, Modal, Stack, Text } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { type } from 'arktype'
import { useTabletopEnvironmentStore } from '~/routes/tabletop/-hooks/useTabletopEnvironmentStore'
import { startRoundAction, startRoundQuerySync } from '~/routes/tabletop/-utils/gameActions/startRound'
import { UNSAFE_updateAggressionAction, updateAggressionQuerySync } from '~/routes/tabletop/-utils/gameActions/updateAggression'
import getQueryKey from '~/routes/tabletop/-utils/getQueryKey'
import { getServiceClient } from '~/supabase/getServiceClient'
import { requireGM } from '~/supabase/requireGM'
import { useTabletopEnemyList } from '~/tt/-hooks/tabletopData/useTabletopEnemyList'
import { type TabletopRoundData } from '~/tt/-hooks/tabletopData/useTabletopRound'
import { mutationError } from '~/utils/mutationError'

export default function ResetRounds() {
	const { campaignId } = useTabletopEnvironmentStore()
	const queryClient = useQueryClient()

	const [opened, { open, close }] = useDisclosure(false)

	const { data: enemyList } = useTabletopEnemyList()

	const resetRounds = useMutation({
		mutationFn: resetRoundsAction,
		onMutate: () => {
			const queryKey = getQueryKey({ type: 'round' })
			void queryClient.cancelQueries({ queryKey })
			queryClient.setQueryData(queryKey, (oldData: TabletopRoundData) => {
				return {
					...oldData,
					round: 0
				} satisfies TabletopRoundData
			})

			startRoundQuerySync({ queryClient })

			updateAggressionQuerySync({
				queryClient,
				data: {
					target: { tabletopCharacterIds: enemyList },
					amount: { absolute: 0 }
				}
			})
		},
		onError: error => {
			mutationError(error, 'Failed to clear the encounter')
		}
	})

	const handleConfirmSelection = () => {
		resetRounds.mutate({ data: { campaignId } })
		close()
	}

	return (
		<>
			<Button onClick={open}>Reset Rounds</Button>

			<Modal opened={opened} onClose={close} title='Confirm action'>
				<Stack>
					<Text>Are you sure you want to reset the rounds?</Text>
					<Group>
						<Button onClick={close} variant='default' flex={1}>Cancel</Button>
						<Button color='red' onClick={handleConfirmSelection}>Confirm</Button>
					</Group>
				</Stack>
			</Modal>
		</>
	)
}

const resetRoundsSchema = type({
	campaignId: 'number'
})

const resetRoundsAction = createServerFn({ method: 'POST' })
	.inputValidator(resetRoundsSchema)
	.handler(async ({ data: { campaignId } }) => {
		const { supabase } = await requireGM({ campaignId })

		const serviceClient = getServiceClient()

		{
			const { error } = await serviceClient
				.from('tabletop_info')
				.update({
					round: 0
				})
				.eq('campaign_id', campaignId)
			if (error) throw new Error(error.message, { cause: error })
		}

		await startRoundAction({ data: { campaignId } })

		{
			const { data, error } = await supabase
				.from('tabletop_characters')
				.select('tabletopCharacterId: tt_character_id')
				.eq('campaign_id', campaignId)
				.eq('character_type', 'ENEMY')
			if (error) throw new Error(error.message, { cause: error })

			for (const { tabletopCharacterId } of data) {
				await UNSAFE_updateAggressionAction({
					target: { tabletopCharacterIds: [tabletopCharacterId] },
					amount: { absolute: 0 }
				})
			}
		}
	})
