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
		.select(`
			heroId: hero_id,
			heroName: hero_name
		`)
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
					return <HeroCard key={hero.heroId} {...hero} />
				})}
			</Group>
		</Stack>
	)
}

type HeroCardProps = {
	heroId: number
	heroName: string
}

function HeroCard({ heroId, heroName }: HeroCardProps) {
	return (
		<Card>
			<Title order={3}>{heroName}</Title>
			<Button component={Link}to={`/hero/${heroId}`}>View Hero</Button>
		</Card>
	)
}
