import { ActionIcon, Avatar, Button, Group, Menu, Modal, NumberInput, Stack, Table, Text, Title, type NumberInputProps } from '@mantine/core'
import { useForm } from '@mantine/form'
import { useDisclosure } from '@mantine/hooks'
import { IconPencil, IconTrash, IconX } from '@tabler/icons-react'
import { useMutation } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { type } from 'arktype'
import { Fragment } from 'react'
import { type Tables } from '~/supabase/databaseTypes'
import { getSupabaseServerClient } from '~/supabase/getSupabaseServerClient'
import { useSupabase } from '~/supabase/useSupabase'
import { useTabletopCharacters } from '../../../-hooks/-useTabletopData'

export default function Characters() {
	const { data: characters } = useTabletopCharacters()

	return (
		<Stack gap={0}>
			<Title order={3}>Characters</Title>
			<Table>
				<Table.Thead>
					<Table.Tr>
						<Table.Th>Name</Table.Th>
						<Table.Th>Shield</Table.Th>
						<Table.Th>Health</Table.Th>
						<Table.Th>Position</Table.Th>
						<Table.Th>Edit</Table.Th>
					</Table.Tr>
				</Table.Thead>
				<Table.Tbody>
					{Object.values(characters).map(character => {
						if (character.tabletop_characters === null) return null
						return (
							<Character
								key={character.character_id}
								character_id={character.character_id}
							/>
						)
					})}
				</Table.Tbody>
			</Table>
		</Stack>
	)
}

type CharacterProps = {
	character_id: number
}

function Character({ character_id }: CharacterProps) {
	const { character_name, tabletop_characters } = useTabletopCharacters().data[character_id] ?? {}

	const [editMode, editModeHandlers] = useDisclosure(false)

	const removeCharacter = useMutation({
		mutationFn: removeCharacterAction
	})

	const getTabletopLifeValue = (value: keyof Tables<'tabletop_characters'> & (`health_${string}` | `shield_${string}`)) => {
		return tabletop_characters?.[value] ?? 0
	}

	const getTabletopPosition = () => {
		if (!tabletop_characters) return null
		if (
			tabletop_characters.position_q === null
			|| tabletop_characters.position_r === null
			|| tabletop_characters.position_s === null
		) return null
		const position = {
			q: tabletop_characters.position_q,
			r: tabletop_characters.position_r,
			s: tabletop_characters.position_s
		}
		return `${position.q},${position.r},${position.s}`
	}

	return (
		<Fragment>
			<CharacterEditModal
				character_id={character_id}
				opened={editMode}
				close={editModeHandlers.close}
			/>

			<Table.Tr>
				<Table.Td>
					<Group gap='xs'>
						<Avatar />
						<Text size='lg'>{character_name}</Text>
					</Group>
				</Table.Td>
				<Table.Td>
					<Stack gap={0}>
						<Text size='sm'>{getTabletopLifeValue('shield_durability')}</Text>
						<Text size='sm'>{getTabletopLifeValue('shield_current')} / {getTabletopLifeValue('shield_max')}</Text>
					</Stack>
				</Table.Td>
				<Table.Td>{getTabletopLifeValue('health_current')} / {getTabletopLifeValue('health_max')}</Table.Td>
				<Table.Td>{getTabletopPosition() ?? 'Unplaced'}</Table.Td>
				<Table.Td>
					<Group>
						<ActionIcon variant='subtle' color='gray' onClick={editModeHandlers.toggle}>
							<IconPencil />
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
									onClick={() => removeCharacter.mutate({ data: { characterId: character_id } })}
								>
									Remove Character
								</Menu.Item>
							</Menu.Dropdown>
						</Menu>
					</Group>
				</Table.Td>
			</Table.Tr>
		</Fragment>
	)
}

const removeCharacterSchema = type({
	characterId: 'number'
})

const removeCharacterAction = createServerFn({ method: 'POST' })
	.validator(removeCharacterSchema)
	.handler(async ({ data: { characterId } }) => {
		const supabase = getSupabaseServerClient()

		const { error } = await supabase
			.from('tabletop_characters')
			.delete()
			.eq('character_id', characterId)
		if (error) throw new Error(error.message, { cause: error })
	})

type CharacterEditModalProps = {
	character_id: number
	opened: boolean
	close: () => void
}

const numberInputProps: NumberInputProps = {
	allowDecimal: false,
	allowNegative: false,
	stepHoldDelay: 500,
	stepHoldInterval: t => Math.max(1000 / t ** 2, 25)
}

function CharacterEditModal({ character_id, opened, close }: CharacterEditModalProps) {
	const { character_name, tabletop_characters } = useTabletopCharacters().data[character_id] ?? {}

	const supabase = useSupabase()

	const form = useForm({
		mode: 'uncontrolled',
		initialValues: {
			shieldDurability: tabletop_characters?.shield_durability ?? 0,
			shieldCurrent: tabletop_characters?.shield_current ?? 0,
			shieldMax: tabletop_characters?.shield_max ?? 0,
			healthCurrent: tabletop_characters?.health_current ?? 0,
			healthMax: tabletop_characters?.health_max ?? 0
		},
		validate: {
			healthMax: value => value > 0 ? null : 'Max health must be greater than 0'
		}
	})

	const handleSubmit = (values: typeof form.values) => {
		(async () => {
			const { error } = await supabase
				.from('tabletop_characters')
				.upsert({
					character_id,
					shield_durability: values.shieldDurability,
					shield_current: values.shieldCurrent,
					shield_max: values.shieldMax,
					health_current: values.healthCurrent,
					health_max: values.healthMax
				})
			if (error) throw new Error(error.message, { cause: error })
		})().catch(console.error)
		close()
	}

	return (
		<Modal
			opened={opened}
			onClose={close}
			onExitTransitionEnd={() => form.reset()}
			title={`Edit ${character_name}`}
		>
			<form onSubmit={form.onSubmit(handleSubmit)}>
				<Stack>
					<Group grow>
						<NumberInput
							label='Shield Durability'
							key={form.key('shieldDurability')}
							{...form.getInputProps('shieldDurability')}
							{...numberInputProps}
						/>
						<NumberInput
							label='Current Shield'
							key={form.key('shieldCurrent')}
							{...form.getInputProps('shieldCurrent')}
							{...numberInputProps}
						/>
						<NumberInput
							label='Max Shield'
							key={form.key('shieldMax')}
							{...form.getInputProps('shieldMax')}
							{...numberInputProps}
						/>
					</Group>
					<Group grow align='flex-start'>
						<NumberInput
							label='Current Health'
							key={form.key('healthCurrent')}
							{...form.getInputProps('healthCurrent')}
							{...numberInputProps}
						/>
						<NumberInput
							label='Max Health'
							key={form.key('healthMax')}
							{...form.getInputProps('healthMax')}
							{...numberInputProps}
						/>
					</Group>
					<Group>
						<Button variant='default' onClick={close}>Cancel</Button>
						<Button flex={1} type='submit'>Update</Button>
					</Group>
				</Stack>
			</form>
		</Modal>
	)
}
