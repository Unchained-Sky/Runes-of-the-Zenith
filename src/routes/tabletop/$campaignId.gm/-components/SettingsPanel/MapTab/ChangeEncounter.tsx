import { Button, Card, Group, Modal, Stack, Text, Title, useModalsStack } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { useMutation } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { type } from 'arktype'
import { useState } from 'react'
import { type TablesInsert, type TablesUpdate } from '~/supabase/databaseTypes'
import { getServiceClient } from '~/supabase/getServiceClient'
import { requireAccount } from '~/supabase/requireAccount'
import { useTabletopCurrentEncounter, useTabletopEncounterList } from '../../../-hooks/useTabletopData'

export default function ChangeEncounter() {
	const { campaignId } = getRouteApi('/tabletop/$campaignId/gm/').useParams()

	const { data: currentEncounterName } = useTabletopCurrentEncounter()
	const { data: encounterData } = useTabletopEncounterList()

	const modalStack = useModalsStack(['encounter-list', 'confirm'])

	const [selectedEncounter, setSelectedEncounter] = useState<number | null>(null)

	const handleSelectEncounter = (encounterId: number) => {
		setSelectedEncounter(encounterId)
		modalStack.open('confirm')
	}

	const handleCleanupModal = () => {
		setSelectedEncounter(null)
		modalStack.closeAll()
	}

	const changeEncounter = useMutation({
		mutationFn: changeEncounterAction,
		onError: error => {
			notifications.show({
				title: 'Failed change encounter',
				color: 'red',
				message: error.message
			})
		}
	})

	const handleConfirmSelection = () => {
		if (!selectedEncounter) return
		changeEncounter.mutate({ data: { campaignId: +campaignId, encounterId: selectedEncounter } })
		handleCleanupModal()
	}

	return (
		<>
			<Group>
				<Text>
					<Text span>Current Encounter: </Text>
					<Text span fs={currentEncounterName ? 'bold' : 'italic'}>{currentEncounterName ?? 'None'}</Text>
				</Text>

				<Button size='compact-md' onClick={() => modalStack.open('encounter-list')}>Change Encounter</Button>
			</Group>

			<Modal.Stack>
				<Modal {...modalStack.register('encounter-list')} title='Change Encounter' onClose={handleCleanupModal}>
					<Stack>
						<Title order={3}>Compendium</Title>
						<Group>
							{encounterData.compendium.map(encounter => {
								return (
									<EncounterCard
										key={encounter.encounterId}
										id={encounter.encounterId}
										name={encounter.encounterName}
										handleSelectEncounter={handleSelectEncounter}
									/>
								)
							})}
						</Group>
						<Title order={3}>Homebrew</Title>
						<Group>
							{encounterData.homebrew.map(encounter => {
								return (
									<EncounterCard
										key={encounter.encounterId}
										id={encounter.encounterId}
										name={encounter.encounterName}
										handleSelectEncounter={handleSelectEncounter}
									/>
								)
							})}
						</Group>
					</Stack>

					<Modal {...modalStack.register('confirm')} title='Confirm action' onClose={handleCleanupModal}>
						<Stack>
							<Text>Are you sure you want to change the encounter? This will override all current map data</Text>
							<Group justify='flex-end'>
								<Button onClick={handleCleanupModal} variant='default'>Cancel</Button>
								<Button color='red' onClick={handleConfirmSelection}>Confirm</Button>
							</Group>
						</Stack>
					</Modal>
				</Modal>

			</Modal.Stack>

		</>
	)
}

type EncounterCardProps = {
	id: number
	name: string
	handleSelectEncounter: (encounterId: number) => void
}

function EncounterCard({ id, name, handleSelectEncounter }: EncounterCardProps) {
	return (
		<Card component={Stack} gap={0} align='center' p='sm' bg='dark.5'>
			<Text>{name}</Text>
			<Button size='compact-md' onClick={() => handleSelectEncounter(id)}>Select</Button>
		</Card>
	)
}

const changeEncounterSchema = type({
	campaignId: 'number',
	encounterId: 'number'
})

const changeEncounterAction = createServerFn({ method: 'POST' })
	.validator(changeEncounterSchema)
	.handler(async ({ data: { campaignId, encounterId } }) => {
		const { supabase, user } = await requireAccount()

		{
			// check if user is GM
			const { error } = await supabase
				.from('campaign_info')
				.select('user_id')
				.eq('campaign_id', campaignId)
				.eq('user_id', user.id)
				.limit(1)
				.single()
			if (error) throw new Error(error.message, { cause: error })
		}

		// check if encounter exists and get data
		const { data: encounterData, error: encounterError } = await supabase
			.from('encounter_info')
			.select(`
					encounterId: encounter_id,
					mapId: map_id,
					encounterTiles: encounter_tile (
						q,
						r,
						s,
						enemyId: enemy_id
					)
				`)
			.eq('encounter_id', encounterId)
			.limit(1)
			.single()
		if (encounterError) throw new Error(encounterError.message, { cause: encounterError })

		const serverClient = getServiceClient()

		{
			// delete all tabletop tiles
			const { error } = await serverClient
				.from('tabletop_tiles')
				.delete()
				.eq('campaign_id', campaignId)
			if (error) throw new Error(error.message, { cause: error })
		}

		{
			// TODO - add an option to not clear hero data
			// delete all tabletop characters
			const { error } = await serverClient
				.from('tabletop_characters')
				.delete()
				.eq('campaign_id', campaignId)
			if (error) throw new Error(error.message, { cause: error })
		}

		{
			// update current encounter
			const { error } = await serverClient
				.from('tabletop_info')
				.update({ campaign_id: campaignId, encounter_id: encounterId })
				.eq('campaign_id', campaignId)
			if (error) throw new Error(error.message, { cause: error })
		}

		{
			// place enemies on map
			type EncounterTile = typeof encounterData['encounterTiles'][number]
			interface FilteredEncounterTile extends EncounterTile {
				enemyId: number
			}
			function hasEnemyId(tile: EncounterTile): tile is FilteredEncounterTile {
				return 'enemyId' in tile
			}
			const tilesWithEnemies = encounterData.encounterTiles.filter(hasEnemyId)

			const { data: characterIds, error: characterError } = await serverClient
				.from('tabletop_characters')
				.insert(
					Array.from({ length: tilesWithEnemies.length }).map(() => ({
						campaign_id: campaignId,
						character_type: 'ENEMY'
					}) satisfies TablesInsert<'tabletop_characters'>)
				)
				.select('characterId: character_id')
			if (characterError) throw new Error(characterError.message, { cause: characterError })

			{
				const { error } = await serverClient
					.from('tabletop_enemy')
					.insert(
						tilesWithEnemies.map(({ enemyId }, index) => ({
							enemy_id: enemyId,
							character_id: characterIds[index]?.characterId ?? -1
						}))
					)
				if (error) throw new Error(error.message, { cause: error })
			}

			const { error: tilesError } = await serverClient
				.from('tabletop_tiles')
				.upsert(
					characterIds.map(({ characterId }, index) => {
						const enemy = tilesWithEnemies[index]
						if (!enemy) throw new Error('Invalid enemy data')
						return {
							campaign_id: campaignId,
							q: enemy.q,
							r: enemy.r,
							s: enemy.s,
							character_id: characterId
						} satisfies TablesUpdate<'tabletop_tiles'>
					})
				)
			if (tilesError) throw new Error(tilesError.message, { cause: tilesError })
		}
	})
