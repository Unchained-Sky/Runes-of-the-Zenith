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

export const Route = createFileRoute('/homebrew/map/$id_/edit/')({
	component: RouteComponent,
	loader: async ({ params: { id } }) => await serverLoader({ data: { mapId: id } }),
	head: ({ loaderData }) => ({
		meta: loaderData ? [{ title: `Edit Map: ${loaderData.map_name}` }] : undefined
	})
})

const serverLoaderSchema = type({
	mapId: 'string.digits'
})

const serverLoader = createServerFn({ method: 'GET' })
	.validator(serverLoaderSchema)
	.handler(async ({ data: { mapId: mapIdString } }) => {
		const mapId = parseInt(mapIdString)

		const { supabase } = await requireAccount({ backlink: '/homebrew/map' })

		const { data, error } = await supabase
			.from('map_info')
			.select(`
				map_name,
				map_id,
				map_combat_tile(*),
				tile_count:map_combat_tile(count)
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

				<MapTitle loaderMapName={loaderData.map_name} />

				<CombatGridEdit />

				<TileEditPanel />

				<Submit />
			</Fragment>
		)
		: <Templates />
}
