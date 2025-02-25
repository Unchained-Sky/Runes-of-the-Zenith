import { Button, rem, Stack, Title } from '@mantine/core'
import { type LoaderFunctionArgs } from '@remix-run/node'
import { Link, redirect, useLoaderData, type MetaFunction } from '@remix-run/react'
import { getServerClient } from '~/supabase/getServerClient'
import { isNumberParam } from '~/utils/isNumberParam'

export const meta: MetaFunction<typeof loader> = ({ data }) => {
	return [
		{ title: data?.mapName ?? 'Map' }
	]
}

export async function loader({ params, request }: LoaderFunctionArgs) {
	const mapId = isNumberParam(params.id, request.headers)

	const { supabase, headers } = getServerClient(request)

	const { data, error } = await supabase
		.from('map_info')
		.select('mapName:name, mapId:map_id')
		.eq('map_id', mapId)
	if (error || !data.length) throw redirect('/homebrew/map', { headers })

	return data[0]
}

export default function Route() {
	const { mapName, mapId } = useLoaderData<typeof loader>()

	return (
		<Stack>
			<Title>{mapName}</Title>

			<Button maw={rem(240)} component={Link} to={`/homebrew/map/${mapId}/edit`}>Edit</Button>
		</Stack>
	)
}
