import { Avatar, Button, Card, Group, Stack, Text, Title } from '@mantine/core'
import { useMutation } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { type } from 'arktype'
import { getSupabaseServerClient } from '~/supabase/getSupabaseServerClient'
import { useTabletopCharacters } from '../../../-hooks/-useTabletopData'

export default function InactiveCharacters() {
	const { data: characters } = useTabletopCharacters()

	const inactiveCharacters = Object.values(characters)
		.filter(({ tabletop_characters }) => tabletop_characters === null)

	const addCharacter = useMutation({
		mutationFn: addCharacterAction
	})

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
								onClick={() => addCharacter.mutate({ data: { characterId: character.character_id } })}
							>Add
							</Button>
						</Card>
					)
				})}
			</Group>
		</Stack>
	)
}

const addCharacterSchema = type({
	characterId: 'number'
})

const addCharacterAction = createServerFn({ method: 'POST' })
	.validator(addCharacterSchema)
	.handler(async ({ data: { characterId } }) => {
		const supabase = getSupabaseServerClient()

		const { error } = await supabase
			.from('tabletop_characters')
			.upsert({
				character_id: characterId
			})
		if (error) throw new Error(error.message, { cause: error })
	})
