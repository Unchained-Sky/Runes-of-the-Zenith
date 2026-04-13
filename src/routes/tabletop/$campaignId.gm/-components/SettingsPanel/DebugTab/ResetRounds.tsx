import { Button, Group, Modal, Stack, Text } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useMutation } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { type } from 'arktype'
import { useTabletopContext } from '~/routes/tabletop/-context/TabletopContext'
import { getServiceClient } from '~/supabase/getServiceClient'
import { requireGM } from '~/supabase/requireGM'
import { resetAggressionAction, resetAggressionQuerySync } from '~/tt-gm/-utils/resetAggression'
import { startRoundAction, startRoundQuerySync } from '~/tt-gm/-utils/startRound'
import { useTabletopEnemyList } from '~/tt/-hooks/tabletopData/useTabletopEnemyList'
import { type TabletopRoundData } from '~/tt/-hooks/tabletopData/useTabletopRound'
import { mutationError } from '~/utils/mutationError'

export default function ResetRounds() {
	const { queryClient, campaignId } = useTabletopContext()

	const [opened, { open, close }] = useDisclosure(false)

	const { data: enemyList } = useTabletopEnemyList()

	const resetRounds = useMutation({
		mutationFn: resetRoundsAction,
		onMutate: () => {
			void queryClient.cancelQueries({ queryKey: [campaignId, 'tabletop', 'round'] })
			queryClient.setQueryData([campaignId, 'tabletop', 'round'], (oldData: TabletopRoundData) => {
				return {
					...oldData,
					round: 0
				} satisfies TabletopRoundData
			})

			startRoundQuerySync({ queryClient, campaignId })

			enemyList.forEach(tabletopCharacterId => {
				resetAggressionQuerySync({
					queryClient,
					campaignId,
					tabletopCharacterId
				})
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
				await resetAggressionAction({ data: { tabletopCharacterId } })
			}
		}
	})
