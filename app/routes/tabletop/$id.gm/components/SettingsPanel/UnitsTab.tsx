import { ActionIcon, Avatar, Button, Card, Group, NumberInput, Stack, Table, Text, Title } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useOutletContext } from '@remix-run/react'
import { IconPencil, IconX } from '@tabler/icons-react'
import { type OutletContext } from 'app/root'
import { useTabletopGMStore } from '../../useTabletopGMStore'

export default function UnitsTab() {
	return (
		<Stack>
			<Characters />
			<InactiveCharacters />
		</Stack>
	)
}

function Characters() {
	const characters = useTabletopGMStore(state => state.characters)

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
								character_name={character.character_name}
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
	character_name: string
}

function Character({ character_id, character_name }: CharacterProps) {
	const { supabase } = useOutletContext<OutletContext>()

	const [editMode, editModeHandlers] = useDisclosure(false)

	const removeCharacter = async () => {
		const { error } = await supabase
			.from('tabletop_characters')
			.delete()
			.eq('character_id', character_id)
		if (error) throw new Error(error.message, { cause: error })
	}

	return editMode
		? (
			<Table.Tr>
				<Table.Td>
					<Group gap='xs'>
						<Avatar />
						<Text size='lg'>{character_name}</Text>
					</Group>
				</Table.Td>
				<Table.Td>
					<Stack gap={0}>
						<NumberInput />
						<Text size='sm'>150 / 200</Text>
					</Stack>
				</Table.Td>
				<Table.Td>200 / 250</Table.Td>
				<Table.Td>0,0,0</Table.Td>
				<Table.Td>
					<ActionIcon variant='subtle' color='gray' onClick={editModeHandlers.toggle}>
						<IconPencil />
					</ActionIcon>
				</Table.Td>
			</Table.Tr>
		)
		: (
			<Table.Tr>
				<Table.Td>
					<Group gap='xs'>
						<Avatar />
						<Text size='lg'>{character_name}</Text>
					</Group>
				</Table.Td>
				<Table.Td>
					<Stack gap={0}>
						<Text size='sm'>3</Text>
						<Text size='sm'>150 / 200</Text>
					</Stack>
				</Table.Td>
				<Table.Td>200 / 250</Table.Td>
				<Table.Td>0,0,0</Table.Td>
				<Table.Td>
					<Group>
						<ActionIcon variant='subtle' color='gray' onClick={editModeHandlers.toggle}>
							<IconPencil />
						</ActionIcon>
						<ActionIcon variant='subtle' color='red'>
							<IconX onClick={() => void removeCharacter()} />
						</ActionIcon>
					</Group>
				</Table.Td>
			</Table.Tr>
		)
}

function InactiveCharacters() {
	const characters = useTabletopGMStore(state => state.characters)
	const { supabase } = useOutletContext<OutletContext>()

	const inactiveCharacters = Object.values(characters).filter(({ tabletop_characters }) => tabletop_characters === null)

	const addCharacter = async (characterId: number) => {
		const { error } = await supabase
			.from('tabletop_characters')
			.upsert({
				character_id: characterId
			})
		if (error) throw new Error(error.message, { cause: error })
	}

	return inactiveCharacters.length > 0 && (
		<Stack gap={0}>
			<Title order={3}>Inactive Characters</Title>
			<Group>
				{inactiveCharacters.map(character => {
					return (
						<Card key={character.character_id} component={Stack} gap={0} align='center' p='sm' bg='dark.5'>
							<Avatar />
							<Text>{character.character_name}</Text>
							<Button
								variant='subtle'
								size='compact-md'
								onClick={() => {
									addCharacter(character.character_id).catch(console.error)
								}}
							>Add
							</Button>
						</Card>
					)
				})}
			</Group>
		</Stack>
	)
}
