import { type ActionFunctionArgs, type LoaderFunctionArgs } from '@remix-run/node'
import { json, redirect, useLoaderData, type MetaFunction } from '@remix-run/react'
import { type } from 'arktype'
import { CombatGridEdit } from '~/components/HoneycombGrid'
import useMountEffect from '~/hooks/useMountEffect'
import { getServerClient } from '~/supabase/getServerClient'
import { getServiceClient } from '~/supabase/getServiceClient'
import { getUserId } from '~/supabase/getUserId'
import { requireAccount } from '~/supabase/requireAccount'
import { isNumberParam } from '~/utils/isNumberParam'
import MapTitle from './components/MapTitle'
import Submit from './components/Submit'
import TileEditPanel from './components/TileEditPanel'
import { useMapEditStore } from './useMapEditStore'

export const meta: MetaFunction<typeof loader> = ({ data }) => {
	return [
		{ title: data?.mapName ?? 'Map' }
	]
}

export type MapEditLoader = ReturnType<typeof useLoaderData<typeof loader>>

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

	return json({
		syncValue: +new Date(),
		...data[0]
	}, { headers })
}

export async function action({ params, request }: ActionFunctionArgs) {
	const mapId = isNumberParam(params.id, request.headers)

	const { supabase, headers } = await requireAccount(request)

	const { userId } = await getUserId(supabase)

	{
		const { data, error } = await supabase
			.from('map_info')
			.select('user_id')
			.eq('map_id', mapId)
		if (error || data[0].user_id !== userId) throw new Error('Invalid user')
	}

	const serviceClient = getServiceClient()

	const dataValidator = type({
		'mapName?': 'string | null',
		'tiles?': {
			'[string]': {
				cord: ['number', 'number', 'number'],
				image: 'string',
				// eslint-disable-next-line @stylistic/quotes
				terrainType: "'BLOCKED' | 'NORMAL' | 'ROUGH' | 'HARSH' | 'GAP'"
			}
		}
	})
	const formData = await request.formData()
	const data = dataValidator(JSON.parse(String(formData.get('data'))))
	if (data instanceof type.errors) throw new Error(data.summary)

	if (data.mapName && data.mapName.length > 0) {
		const { error } = await serviceClient
			.from('map_info')
			.update({
				name: data.mapName
			})
			.eq('map_id', mapId)
		if (error) throw new Error(error.message, { cause: error })
	}

	if (data.tiles) {
		const { error: deleteError } = await serviceClient
			.from('map_combat_tile')
			.delete()
			.eq('map_id', mapId)
		if (deleteError) throw new Error(deleteError.message, { cause: deleteError })

		const { error: insertError } = await serviceClient
			.from('map_combat_tile')
			.insert(Object.values(data.tiles).map(tile => ({
				map_id: mapId,
				q: tile.cord[0],
				r: tile.cord[1],
				s: tile.cord[2],
				image: tile.image,
				terrain_type: tile.terrainType
			})))
		if (insertError) throw new Error(insertError.message, { cause: insertError })
	}

	return redirect(`/homebrew/map/${mapId}/edit`, { headers })
}

export default function MapEditor() {
	const loaderData = useLoaderData<typeof loader>()

	const syncLoader = useMapEditStore(state => state.syncLoader)
	useMountEffect(() => {
		syncLoader(loaderData)
	})

	const syncValue = useMapEditStore(state => state.syncValue)

	if (loaderData.syncValue !== syncValue) return null
	return (
		<>
			<MapTitle loaderMapName={loaderData.mapName} />

			<CombatGridEdit />

			<TileEditPanel />

			<Submit />
		</>
	)
}
