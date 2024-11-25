import { Title } from '@mantine/core'
import { type LoaderFunctionArgs } from '@remix-run/node'
import { json, redirect, useLoaderData, type MetaFunction } from '@remix-run/react'
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
		.select('mapName:name')
		.eq('map_id', mapId)
	if (error || !data.length) throw redirect('/homebrew/map', { headers })

	return json(data[0], { headers })
}

export default function Map() {
	const { mapName } = useLoaderData<typeof loader>()

	return <Title>{mapName}</Title>
}
