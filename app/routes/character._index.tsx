import { Button, Card, Group, rem, Stack, Title } from '@mantine/core'
import { type LoaderFunctionArgs, type MetaFunction } from '@remix-run/node'
import { json, Link, redirect, useLoaderData } from '@remix-run/react'
import { getUserId } from '~/supabase/getUserId'
import { requireAccount } from '~/supabase/requireAccount'

export const meta: MetaFunction = () => {
	return [
		{ title: 'My Characters' }
	]
}

export async function loader({ request }: LoaderFunctionArgs) {
	const { supabase, headers } = await requireAccount(request)

	const { userId } = await getUserId(supabase)

	const { data, error } = await supabase
		.from('character_info')
		.select('character_id, character_name')
		.eq('user_id', userId)
	if (error) throw redirect('/', { headers })

	return json({ characters: data }, { headers })
}

export default function Character() {
	const { characters } = useLoaderData<typeof loader>()

	return (
		<Stack>
			<Title>Characters</Title>

			<Button w={rem(240)} component={Link} to='/character/create'>Create Character</Button>

			<Title order={2}>My Characters</Title>
			<Group>
				{
					characters.map(character => {
						return <CharacterCard key={character.character_id} {...character} />
					})
				}
			</Group>
		</Stack>
	)
}

type CharacterCardProps = {
	character_id: number
	character_name: string
}

function CharacterCard({ character_id, character_name }: CharacterCardProps) {
	return (
		<Card>
			<Title order={3}>{character_name}</Title>
			<Button component={Link}to={`/character/${character_id}`}>View Character</Button>
		</Card>
	)
}
