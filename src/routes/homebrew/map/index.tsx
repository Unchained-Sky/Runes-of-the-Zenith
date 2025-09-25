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
			.select(`
				mapId: map_id,
				mapName: map_name
			`)
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
					return <MapCard key={map.mapId} {...map} />
				})}
			</Group>
		</Stack>
	)
}

type MapCardProps = {
	mapId: number
	mapName: string
}

function MapCard({ mapId, mapName }: MapCardProps) {
	return (
		<Card>
			<Title order={3}>{mapName}</Title>
			<Button component={Link} to={`/homebrew/map/${mapId}`}>View Map</Button>
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
			.select('mapId: map_id')
			.limit(1)
			.single()
		if (error) throw new Error(error.message, { cause: error })

		throw redirect({
			to: '/homebrew/map/$mapId',
			params: { mapId: data.mapId.toString() }
		})
	})
