import { type ActionFunctionArgs, type LoaderFunctionArgs } from '@remix-run/node'
import { json, redirect, useLoaderData, type MetaFunction } from '@remix-run/react'
import { CombatGridEdit } from '~/components/HoneycombGrid'
import useMountEffect from '~/hooks/useMountEffect'
import { getServerClient } from '~/supabase/getServerClient'
import { getServiceClient } from '~/supabase/getServiceClient'
import { getUserId } from '~/supabase/getUserId'
import { requireAccount } from '~/supabase/requireAccount'
import { isNumberParam } from '~/utils/isNumberParam'
import MapTitle from './components/MapTitle'
import Submit from './components/Submit'
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

	const { data, error } = await supabase
		.from('map_info')
		.select('user_id')
		.eq('map_id', mapId)
	if (error || data[0].user_id !== userId) throw new Error('Invalid user')

	const serviceClient = getServiceClient()

	const formData = await request.formData()

	const mapName = formData.get('mapName')
	if (typeof mapName === 'string') {
		const { error } = await serviceClient
			.from('map_info')
			.update({
				name: mapName
			})
			.eq('map_id', mapId)
		if (error) throw new Error(error.message, { cause: error })
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

			<Submit />
		</>
	)
}
