import { Button, Group, Modal, Stack, Text } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useMutation } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { type } from 'arktype'
import { getServiceClient } from '~/supabase/getServiceClient'
import { requireGM } from '~/supabase/requireGM'
import { mutationError } from '~/utils/mutationError'

export default function ClearEncounter() {
	const routeApi = getRouteApi('/tabletop/$campaignId/gm/')
	const { campaignId } = routeApi.useLoaderData()
	const { queryClient } = routeApi.useRouteContext()

	const [opened, { open, close }] = useDisclosure(false)

	const clearEncounter = useMutation({
		mutationFn: clearEncounterAction,
		onMutate: () => {
			void queryClient.cancelQueries({ queryKey: [campaignId, 'tabletop'] })
		},
		onError: error => {
			mutationError(error, 'Failed to clear the encounter')
		}
	})

	const handleConfirmSelection = () => {
		clearEncounter.mutate({ data: { campaignId } })
		close()
	}

	return (
		<>
			<Button onClick={open}>Clear Encounter</Button>

			<Modal
				opened={opened}
				onClose={close}
				title='Confirm action'
			>
				<Stack>
					<Text>Are you sure you want to clear the encounter?</Text>
					<Group>
						<Button onClick={close} variant='default' flex={1}>Cancel</Button>
						<Button color='red' onClick={handleConfirmSelection} flex={1}>Confirm</Button>
					</Group>
				</Stack>
			</Modal>
		</>
	)
}

const clearEncounterSchema = type({
	campaignId: 'number'
})

const clearEncounterAction = createServerFn({ method: 'POST' })
	.validator(clearEncounterSchema)
	.handler(async ({ data: { campaignId } }) => {
		const { supabase } = await requireGM({ campaignId })

		const serviceClient = getServiceClient()

		{
			// clear tiles
			const { error } = await serviceClient
				.from('tabletop_tiles')
				.delete()
				.eq('campaign_id', campaignId)
			if (error) throw new Error(error.message, { cause: error })
		}

		{
			const { data: heroesList, error: heroesError } = await supabase
				.from('tabletop_hero_turn')
				.select(`
					tabletop_characters (
						characterId: tt_character_id
					)
				`)
				.eq('tabletop_characters.campaign_id', campaignId)
			if (heroesError) throw new Error(heroesError.message, { cause: heroesError })

			// delete all hero turns
			const { error } = await serviceClient
				.from('tabletop_hero_turn')
				.delete()
				.in('tt_character_id', heroesList.map(character => character.tabletop_characters.characterId))
			if (error) throw new Error(error.message, { cause: error })
		}

		{
			// delete all tabletop enemies
			const { error } = await serviceClient
				.from('tabletop_characters')
				.delete()
				.eq('campaign_id', campaignId)
				.eq('character_type', 'ENEMY')
			if (error) throw new Error(error.message, { cause: error })
		}

		{
			// update to no encounter
			const { error } = await serviceClient
				.from('tabletop_info')
				.update({ encounter_id: null })
				.eq('campaign_id', campaignId)
			if (error) throw new Error(error.message, { cause: error })
		}
	})
