import { Box, Title } from '@mantine/core'
import { type LoaderFunctionArgs } from '@remix-run/node'
import { json, type MetaFunction, redirect, useLoaderData } from '@remix-run/react'
import HoneycombGrid from '~/components/HoneycombGrid'
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
		.select(`
			mapName:name,
			mapId:map_id,
			mapTiles:map_combat_tile(*),
			tileCount:map_combat_tile(count)
		`)
		.eq('map_id', mapId)
	if (error || !data.length) throw redirect('/homebrew/map', { headers })

	if (!data[0].tileCount[0].count) throw redirect(`/homebrew/map/${mapId}/template`, { headers })

	return json(data[0], { headers })
}

export default function Map() {
	const { mapName, mapTiles } = useLoaderData<typeof loader>()

	return (
		<Box>
			<Title>{mapName}</Title>

			<HoneycombGrid
				tiles={mapTiles.map(({ q, r, s, image, terrain_type }) => ({
					cord: [q, r, s],
					image,
					terrainType: terrain_type
				}))}
			/>
		</Box>
	)
}
