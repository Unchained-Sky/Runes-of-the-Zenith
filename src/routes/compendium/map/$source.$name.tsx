import { Stack, Title } from '@mantine/core'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { type } from 'arktype'
import CombatGridPreview from '~/components/HoneycombGrid/CombatGridPreview'
import { getSupabaseServerClient } from '~/supabase/getSupabaseServerClient'
import { type CombatTile } from '~/types/gameTypes/combatMap'

export const Route = createFileRoute('/compendium/map/$source/$name')({
	component: RouteComponent,
	loader: async ({ params: { source, name } }) => await serverLoader({ data: { source, name } })
})

const serverLoaderSchema = type({
	source: 'string',
	name: 'string'
})

const serverLoader = createServerFn({ method: 'GET' })
	.validator(serverLoaderSchema)
	.handler(async ({ data: { source, name } }) => {
		const supabase = getSupabaseServerClient()

		const { data, error } = await supabase
			.from('map_info')
			.select(`
				compendium_map!inner(
					map_hash
				),
				mapId: map_id,
				mapName: map_name,
				mapCombatTile: map_combat_tile (
					q,
					r,
					s,
					image,
					terrainType: terrain_type
				)
			`)
			.eq('compendium_map.map_hash', `${source}-${name}`)
			.limit(1)
			.maybeSingle()
		if (error) throw new Error(error.message, { cause: error })
		if (!data) throw redirect({ to: '/compendium/map' })

		return {
			mapName: data.mapName,
			tiles: data.mapCombatTile.map<CombatTile>(tile => ({
				cord: [tile.q, tile.r, tile.s],
				image: tile.image,
				terrainType: tile.terrainType
			}))
		}
	})

function RouteComponent() {
	const { mapName, tiles } = Route.useLoaderData()

	return (
		<Stack>
			<Title>{mapName}</Title>

			<CombatGridPreview tiles={tiles} />
		</Stack>
	)
}
