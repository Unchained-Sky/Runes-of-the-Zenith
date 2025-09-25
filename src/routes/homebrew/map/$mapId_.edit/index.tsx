import { LoadingOverlay } from '@mantine/core'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { type } from 'arktype'
import { Fragment, useMemo } from 'react'
import useMountEffect from '~/hooks/useMountEffect'
import { requireAccount } from '~/supabase/requireAccount'
import CombatGridEdit from './-components/CombatGridEdit'
import MapTitle from './-components/MapTitle'
import Submit from './-components/Submit'
import Templates from './-components/Templates'
import TileEditPanel from './-components/TileEditPanel'
import { useMapEditStore } from './-hooks/useMapEditStore'

export const Route = createFileRoute('/homebrew/map/$mapId_/edit/')({
	component: RouteComponent,
	loader: async ({ params: { mapId } }) => await serverLoader({ data: { mapId: +mapId } }),
	head: ({ loaderData }) => ({
		meta: loaderData ? [{ title: `Edit Map: ${loaderData.mapName}` }] : undefined
	})
})

const serverLoaderSchema = type({
	mapId: 'number'
})

const serverLoader = createServerFn({ method: 'GET' })
	.validator(serverLoaderSchema)
	.handler(async ({ data: { mapId } }) => {
		const { supabase } = await requireAccount({ backlink: '/homebrew/map' })

		const { data, error } = await supabase
			.from('map_info')
			.select(`
				mapName: map_name,
				mapId: map_id,
				mapCombatTiles: map_combat_tile(
					q,
					r,
					s,
					image,
					terrainType: terrain_type
				),
				tileCount: map_combat_tile(count)
			`)
			.eq('map_id', mapId)
			.limit(1)
			.maybeSingle()
		if (error) throw new Error(error.message, { cause: error })
		if (!data) throw redirect({ to: '/homebrew/map' })

		return {
			syncValue: +new Date(),
			...data
		}
	})

export type MapEditLoader = Awaited<ReturnType<typeof serverLoader>>

function RouteComponent() {
	const loaderData = Route.useLoaderData()

	const syncLoader = useMapEditStore(state => state.syncLoader)
	useMountEffect(() => {
		syncLoader(loaderData)
	})

	const syncValue = useMapEditStore(state => state.syncValue)
	const submitting = useMapEditStore(state => state.submitting)

	const tiles = useMapEditStore(state => state.tiles)
	const tileCount = useMemo(() => Object.keys(tiles).length, [tiles])

	if (loaderData.syncValue !== syncValue) return null

	return tileCount
		? (
			<Fragment>
				<LoadingOverlay visible={submitting} zIndex={1000} />

				<MapTitle loaderMapName={loaderData.mapName} />

				<CombatGridEdit />

				<TileEditPanel />

				<Submit />
			</Fragment>
		)
		: <Templates />
}
