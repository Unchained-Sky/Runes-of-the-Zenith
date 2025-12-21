import { ActionIcon, Avatar, Button, Card, Group, Menu, Modal, NumberInput, type NumberInputProps, Stack, Text } from '@mantine/core'
import { isInRange, useForm } from '@mantine/form'
import { useDisclosure } from '@mantine/hooks'
import { IconPencil, IconTrash, IconX } from '@tabler/icons-react'
import { useMutation } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { type } from 'arktype'
import { type Enums } from '~/supabase/databaseTypes'
import { getServiceClient } from '~/supabase/getServiceClient'
import { requireGM } from '~/supabase/requireGM'
import { type CombatTileCord } from '~/types/gameTypes/combatMap'
import { mutationError } from '~/utils/mutationError'
import { type TabletopEnemyData } from '../../../-hooks/tabletopData/useTabletopEnemies'
import { type TabletopHeroData } from '../../../-hooks/tabletopData/useTabletopHeroes'

type CharacterCardProps = {
	character: {
		type: Enums<'character_type'>
		tabletopCharacterId: number
		characterName: string
		stats: {
			maxHealth: number
			maxShield: number
			int: number
			str: number
			dex: number
			maxMovement: number
			critChance: number
		}
		tabletopStats: {
			health: number
			wounds: number
			shield: number
			trauma: number
			movement: number
		}
		pos: CombatTileCord | null
	}
	removeCharacter?: () => void
}

export default function CharacterCard({ character, removeCharacter }: CharacterCardProps) {
	const { type, tabletopCharacterId, characterName, stats, tabletopStats, pos } = character

	const [opened, { open, close }] = useDisclosure(false)

	return (
		<>
			<EditCharacterModal character={character} openedModal={opened} closeModal={close} />

			<Card key={tabletopCharacterId} component={Stack} gap={2} align='center' p='sm' bg='dark.5'>
				<Avatar name={characterName} color='red' />
				<Text>{characterName}</Text>
				<Text>
					<Text span>Pos: </Text>
					<Text span fs={pos ? 'normal' : 'italic'}>{pos ? pos.join(',') : 'Unplaced'}</Text>
				</Text>
				<Text>Shield: {tabletopStats.shield} [{tabletopStats.trauma}] / {stats.maxShield}</Text>
				<Text>Health: {tabletopStats.health} [{tabletopStats.wounds}] / {stats.maxHealth}</Text>
				<Text>
					<Text span c='blue'>{stats.int}</Text>
					<Text span> / </Text>
					<Text span c='red'>{stats.str}</Text>
					<Text span> / </Text>
					<Text span c='green'>{stats.dex}</Text>
				</Text>
				<Text>Movement: {tabletopStats.movement} / {stats.maxMovement}</Text>
				<Group gap='xs'>
					<ActionIcon variant='subtle' color='gray'>
						<IconPencil onClick={open} />
					</ActionIcon>
					<Menu>
						<Menu.Target>
							<ActionIcon variant='subtle' color='red'>
								<IconX />
							</ActionIcon>
						</Menu.Target>
						<Menu.Dropdown>
							<Menu.Label>Are you sure?</Menu.Label>
							<Menu.Item
								color='red'
								leftSection={<IconTrash size={14} />}
								onClick={() => removeCharacter?.()}
							>
								Remove {type === 'HERO' ? 'Hero' : 'Enemy'}
							</Menu.Item>
						</Menu.Dropdown>
					</Menu>
				</Group>
			</Card>
		</>
	)
}

const numberInputProps: NumberInputProps = {
	min: 0,
	allowDecimal: false,
	allowNegative: false,
	stepHoldDelay: 500,
	stepHoldInterval: t => Math.max(1000 / t ** 2, 25)
}

type EditCharacterModalProps = {
	character: CharacterCardProps['character']
	openedModal: boolean
	closeModal: () => void
}

function EditCharacterModal({ character, openedModal, closeModal }: EditCharacterModalProps) {
	const routeApi = getRouteApi('/tabletop/$campaignId/gm/')
	const { queryClient } = routeApi.useRouteContext()
	const { campaignId } = routeApi.useLoaderData()

	const form = useForm({
		mode: 'uncontrolled',
		initialValues: {
			currentShield: 10,
			trauma: character.tabletopStats.trauma,
			currentHealth: character.tabletopStats.health,
			wounds: character.tabletopStats.wounds,
			currentMovement: character.tabletopStats.movement
		},
		validate: {
			currentShield: isInRange({ min: 0, max: character.stats.maxShield }, 'Shield must be between 0 and max shield'),
			trauma: isInRange({ min: 0, max: character.stats.maxShield }, 'Trauma must be between 0 and max shield'),
			currentHealth: isInRange({ min: 0, max: character.stats.maxHealth }, 'Health must be between 0 and max health'),
			wounds: isInRange({ min: 0, max: character.stats.maxHealth }, 'Wounds must be between 0 and max health'),
			currentMovement: isInRange({ min: 0, max: character.stats.maxMovement }, 'Movement must be between 0 and max movement')
		}
	})

	const updateCharacter = useMutation({
		mutationFn: updateCharacterAction,
		onMutate: ({ data }) => {
			switch (character.type) {
				case 'HERO':
					void queryClient.cancelQueries({ queryKey: [campaignId, 'tabletop', 'hero', data.tabletopCharacterId] })
					queryClient.setQueriesData({ queryKey: [campaignId, 'tabletop', 'hero', data.tabletopCharacterId] }, (oldData: TabletopHeroData) => {
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
				case 'ENEMY':
					void queryClient.cancelQueries({ queryKey: [campaignId, 'tabletop', 'enemy', data.tabletopCharacterId] })
					queryClient.setQueriesData({ queryKey: [campaignId, 'tabletop', 'enemy', data.tabletopCharacterId] }, (oldData: TabletopEnemyData) => {
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
						} satisfies TabletopEnemyData
					})
					break
			}
		},
		onError: error => {
			mutationError(error, 'Failed to update character')
		}
	})

	const handleSubmit = (values: typeof form.values) => {
		updateCharacter.mutate({ data: { tabletopCharacterId: character.tabletopCharacterId, values } })
		closeModal()
		form.setInitialValues(values)
	}

	return (
		<Modal
			opened={openedModal}
			onClose={closeModal}
			onExitTransitionEnd={form.reset}
			title={`Editing ${character.characterName}`}
			styles={{
				header: {
					zIndex: 0
				}
			}}
		>
			<form onSubmit={form.onSubmit(handleSubmit)}>
				<Stack>

					<Group grow align='flex-start'>
						<NumberInput
							label='Shield Durability'
							key={form.key('currentShield')}
							max={character.stats.maxShield}
							{...form.getInputProps('currentShield')}
							{...numberInputProps}
						/>
						<NumberInput
							label='Trauma'
							key={form.key('trauma')}
							max={character.stats.maxShield}
							{...form.getInputProps('trauma')}
							{...numberInputProps}
						/>
						<NumberInput label='Max Shield' value={character.stats.maxShield} disabled />
					</Group>
					<Group grow align='flex-start'>
						<NumberInput
							label='Current Health'
							key={form.key('currentHealth')}
							max={character.stats.maxHealth}
							{...form.getInputProps('currentHealth')}
							{...numberInputProps}
						/>
						<NumberInput
							label='Wounds'
							key={form.key('wounds')}
							max={character.stats.maxHealth}
							{...form.getInputProps('wounds')}
							{...numberInputProps}
						/>
						<NumberInput label='Max Health' value={character.stats.maxHealth} disabled />
					</Group>
					<Group>
						<Button variant='default' onClick={closeModal}>Cancel</Button>
						<Button flex={1} type='submit'>Update</Button>
					</Group>
				</Stack>
			</form>
		</Modal>
	)
}

const updateCharacterSchema = type({
	tabletopCharacterId: 'number',
	values: {
		currentShield: 'number',
		trauma: 'number',
		currentHealth: 'number',
		wounds: 'number',
		currentMovement: 'number'
	}
})

const updateCharacterAction = createServerFn({ method: 'POST' })
	.validator(updateCharacterSchema)
	.handler(async ({ data: { tabletopCharacterId, values } }) => {
		await requireGM({ tabletopCharacterId })

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
