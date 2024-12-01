import { Box, Title } from '@mantine/core'
import { type LoaderFunctionArgs } from '@remix-run/node'
import { json, type MetaFunction, redirect, useLoaderData } from '@remix-run/react'
import { getServerClient } from '~/supabase/getServerClient'
import { isNumberParam } from '~/utils/isNumberParam'
import Honeycomb from './components/Honeycomb'

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

	return json(data[0], { headers })
}

export default function Map() {
	const { mapName } = useLoaderData<typeof loader>()

	return (
		<Box>
			<Title>{mapName}</Title>

			<Honeycomb />
		</Box>
	)
}
