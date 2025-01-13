import { Button, Card, Group, rem, Stack, Title } from '@mantine/core'
import { type LoaderFunctionArgs } from '@remix-run/node'
import { Form, json, Link, redirect, useLoaderData, type MetaFunction } from '@remix-run/react'
import { getUserId } from '~/supabase/getUserId'
import { requireAccount } from '~/supabase/requireAccount'

export const meta: MetaFunction = () => {
	return [
		{ title: 'My Maps' }
	]
}

export async function loader({ request }: LoaderFunctionArgs) {
	const { supabase, headers } = await requireAccount(request)

	const { userId } = await getUserId(supabase)

	const { data, error } = await supabase
		.from('map_info')
		.select('mapId:map_id, name')
		.eq('user_id', userId)
	if (error) throw redirect('/', { headers })

	return json({ maps: data.reverse() }, { headers })
}

export default function Maps() {
	const { maps } = useLoaderData<typeof loader>()

	return (
		<Stack>
			<Title>Maps</Title>

			<Form method='POST' action='/homebrew/map/create'>
				<Button w={rem(240)} type='submit'>Create Map</Button>
			</Form>

			<Title order={2}>My Maps</Title>
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
	name: string
}

function MapCard({ mapId, name }: MapCardProps) {
	return (
		<Card>
			<Title order={3}>{name}</Title>
			<Button component={Link} to={`/homebrew/map/${mapId}`}>View Map</Button>
		</Card>
	)
}
