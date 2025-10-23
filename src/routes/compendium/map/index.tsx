import { Button, Card, Group, Stack, Title } from '@mantine/core'
import { createFileRoute, Link } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { getSupabaseServerClient } from '~/supabase/getSupabaseServerClient'

export const Route = createFileRoute('/compendium/map/')({
	component: RouteComponent,
	loader: async () => await serverLoader(),
	head: () => ({
		meta: [{ title: 'Maps' }]
	}),
	staleTime: Infinity
})

const serverLoader = createServerFn({ method: 'GET' })
	.handler(async () => {
		const supabase = getSupabaseServerClient()

		const { data, error } = await supabase
			.from('compendium_map')
			.select(`
				mapId: map_id,
				mapSource: map_source,
				mapInfo: map_info (
					mapName: map_name
				)
			`)
		if (error) throw new Error(error.message, { cause: error })

		return {
			maps: data.reduce<{ [mapSource: string]: { [mapId: number]: { mapId: number, mapName: string } } }>((acc, curr) => {
				return ({
					...acc,
					[curr.mapSource]: {
						...acc[curr.mapSource],
						[curr.mapId]: {
							mapId: curr.mapId,
							mapName: curr.mapInfo.mapName
						}
					}
				})
			}, {})
		}
	})

function RouteComponent() {
	const { maps } = Route.useLoaderData()

	return (
		<Stack>
			<Title>Maps</Title>

			<Stack>
				{Object.entries(maps).map(([mapSource, maps]) => {
					return (
						<Stack key={mapSource}>
							<Title order={2}>{mapSource}</Title>
							<Group>
								{Object.values(maps).map(map => {
									return (
										<MapCard
											key={map.mapId}
											mapName={map.mapName}
											mapSource={mapSource}
										/>
									)
								})}
							</Group>
						</Stack>
					)
				})}
			</Stack>
		</Stack>
	)
}

type MapCardProps = {
	mapName: string
	mapSource: string
}

function MapCard({ mapSource, mapName }: MapCardProps) {
	return (
		<Card>
			<Title order={3}>{mapName}</Title>
			<Button component={Link} to={`/compendium/map/${mapSource}/${mapName}`.toLowerCase()}>View Map</Button>
		</Card>
	)
}
