import { Button, Card, Group, rem, Stack, Title } from '@mantine/core'
import { createFileRoute, Link } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { requireAccount } from '~/supabase/requireAccount'

export const Route = createFileRoute('/hero/')({
	component: RouteComponent,
	loader: async () => await serverLoader(),
	head: () => ({
		meta: [{ title: 'Heroes' }]
	})
})

const serverLoader = createServerFn({ method: 'GET' }).handler(async () => {
	const { supabase, user } = await requireAccount({ backlink: '/hero' })

	const { data, error } = await supabase
		.from('hero_info')
		.select('hero_id, hero_name')
		.eq('user_id', user.id)
	if (error) throw new Error(error.message, { cause: error })

	return {
		heroes: data
	}
})

function RouteComponent() {
	const { heroes } = Route.useLoaderData()

	return (
		<Stack>
			<Title>Heroes</Title>

			<Button
				maw={rem(240)}
				component={Link}
				to='/hero/create'
			>
				Create Hero
			</Button>

			<Title order={2}>My Heroes</Title>
			<Group>
				{heroes.map(hero => {
					return <HeroCard key={hero.hero_id} {...hero} />
				})}
			</Group>
		</Stack>
	)
}

type HeroCardProps = {
	hero_id: number
	hero_name: string
}

function HeroCard({ hero_id, hero_name }: HeroCardProps) {
	return (
		<Card>
			<Title order={3}>{hero_name}</Title>
			<Button component={Link}to={`/hero/${hero_id}`}>View Hero</Button>
		</Card>
	)
}
