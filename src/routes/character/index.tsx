import { Button, Card, Group, rem, Stack, Title } from '@mantine/core'
import { createFileRoute, Link } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { requireAccount } from '~/supabase/requireAccount'

export const Route = createFileRoute('/character/')({
	component: RouteComponent,
	loader: async () => await serverLoader(),
	head: () => ({
		meta: [{ title: 'Characters' }]
	})
})

const serverLoader = createServerFn({ method: 'GET' }).handler(async () => {
	const { supabase, user } = await requireAccount({ backlink: '/character' })

	const { data: charactersData, error } = await supabase
		.from('character_info')
		.select('character_id, character_name')
		.eq('user_id', user.id)
	if (error) throw new Error(error.message, { cause: error })

	return { characters: charactersData }
})

function RouteComponent() {
	const { characters } = Route.useLoaderData()

	return (
		<Stack>
			<Title>Characters</Title>

			<Button
				maw={rem(240)}
				component={Link}
				to='/character/create'
			>Create Character
			</Button>

			<Title order={2}>My Characters</Title>
			<Group>
				{characters.map(character => {
					return <CharacterCard key={character.character_id} {...character} />
				})}
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
