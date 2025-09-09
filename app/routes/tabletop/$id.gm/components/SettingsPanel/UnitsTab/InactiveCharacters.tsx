import { Avatar, Button, Card, Group, Stack, Text, Title } from '@mantine/core'
import { useOutletContext } from '@remix-run/react'
import { type OutletContext } from 'app/root'
import { useTabletopGMStore } from '../../../useTabletopGMStore'

export default function InactiveCharacters() {
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
