import { Button, rem, TextInput } from '@mantine/core'
import { useSetState } from '@mantine/hooks'
import { type ActionFunctionArgs, type LoaderFunctionArgs } from '@remix-run/node'
import { json, type MetaFunction, redirect, useLoaderData, useSubmit } from '@remix-run/react'
import { useMemo } from 'react'
import { CombatGridEdit } from '~/components/HoneycombGrid'
import { type CombatTile } from '~/data/mapTemplates/combat'
import { getServerClient } from '~/supabase/getServerClient'
import { getServiceClient } from '~/supabase/getServiceClient'
import { getUserId } from '~/supabase/getUserId'
import { requireAccount } from '~/supabase/requireAccount'
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
	if (mapName) {
		const { error } = await serviceClient
			.from('map_info')
			.update({
				name: mapName as string
			})
			.eq('map_id', mapId)
		if (error) throw new Error(error.message, { cause: error })
	}

	return redirect(`/homebrew/map/${mapId}/edit`, { headers })
}

type MapChanges = {
	mapName: string | null
}

export type TileString = `${number},${number},${number}`

export default function MapEditor() {
	const { mapName, mapTiles } = useLoaderData<typeof loader>()

	const [mapChanges, setMapChanges] = useSetState<MapChanges>({
		mapName: null
	})

	const hasChanged = useMemo(() => Object.values(mapChanges).some(v => v), [mapChanges])

	const submit = useSubmit()

	const tiles = useMemo(() => {
		return new Map<TileString, CombatTile>([
			...mapTiles.map<[TileString, CombatTile]>(({ q, r, s, image, terrain_type }) => [
				`${q},${r},${s}` as const,
				{
					cord: [q, r, s],
					image,
					terrainType: terrain_type
				}
			])
		])
	}, [mapTiles])

	return (
		<>
			<TextInput
				pb='sm'
				maw={rem(300)}
				maxLength={32}
				placeholder={mapName}
				value={mapChanges.mapName ?? ''}
				onChange={event => setMapChanges({ mapName: event.currentTarget.value || null })}
			/>

			<CombatGridEdit tiles={tiles} />

			{hasChanged && (
				<Button
					type='submit'
					pos='absolute'
					size='xl'
					color='green'
					right={rem(32)}
					bottom={rem(32)}
					onClick={() => {
						submit(mapChanges, { method: 'POST', encType: 'multipart/form-data' })
						setMapChanges({
							mapName: null
						})
					}}
				>
					Save
				</Button>
			)}
		</>
	)
}
