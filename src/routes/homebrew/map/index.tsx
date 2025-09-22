import { Button, Card, Group, rem, Stack, Title } from '@mantine/core'
import { useMutation } from '@tanstack/react-query'
import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { requireAccount } from '~/supabase/requireAccount'

export const Route = createFileRoute('/homebrew/map/')({
	component: RouteComponent,
	loader: async () => await serverLoader(),
	head: () => ({
		meta: [{ title: 'Maps' }]
	})
})

const serverLoader = createServerFn({ method: 'GET' })
	.handler(async () => {
		const { supabase, user } = await requireAccount({ backlink: '/homebrew/map' })

		const { data, error } = await supabase
			.from('map_info')
			.select('map_id, map_name')
			.eq('user_id', user.id)
			.order('map_id', { ascending: false })
		if (error) throw new Error(error.message, { cause: error })

		return {
			maps: data
		}
	})

function RouteComponent() {
	const { maps } = Route.useLoaderData()

	const createMap = useMutation({
		mutationFn: createMapAction
	})

	return (
		<Stack>
			<Title>Maps</Title>

			<Button
				w={rem(240)}
				loading={!!createMap.submittedAt}
				onClick={() => createMap.mutate({})}
			>
				Create Map
			</Button>

			<Title>My Maps</Title>
			<Group>
				{maps.map(map => {
					return <MapCard key={map.map_id} {...map} />
				})}
			</Group>
		</Stack>
	)
}

type MapCardProps = {
	map_id: number
	map_name: string
}

function MapCard({ map_id, map_name }: MapCardProps) {
	return (
		<Card>
			<Title order={3}>{map_name}</Title>
			<Button component={Link} to={`/homebrew/map/${map_id}`}>View Map</Button>
		</Card>
	)
}

const createMapAction = createServerFn({ method: 'POST' })
	.handler(async () => {
		const { supabase } = await requireAccount({ backlink: '/homebrew/map' })

		const { data, error } = await supabase
			.from('map_info')
			.insert({
				map_type: 'COMBAT'
			})
			.select('map_id')
			.limit(1)
			.single()
		if (error) throw new Error(error.message, { cause: error })

		throw redirect({
			to: '/homebrew/map/$id',
			params: { id: data.map_id.toString() }
		})
	})
