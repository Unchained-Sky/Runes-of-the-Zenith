import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { type } from 'arktype'
import { requireAccount } from '~/supabase/requireAccount'
import { type CombatTile } from '~/types/gameTypes/combatMap'

const mapTilesLoaderSchema = type({
	campaignId: 'number'
})

const mapTilesLoader = createServerFn({ method: 'GET' })
	.validator(mapTilesLoaderSchema)
	.handler(async ({ data: { campaignId } }) => {
		const { supabase } = await requireAccount({ backlink: '/campaigns' })

		const { data, error } = await supabase
			.from('tabletop_info')
			.select(`
				encounterId: encounter_id (
					mapInfo: map_info (
						mapCombatTiles: map_combat_tile (
							q,
							r,
							s,
							image,
							terrainType: terrain_type
						)
					)
				)
			`)
			.eq('campaign_id', campaignId)
			.limit(1)
			.maybeSingle()
		if (error) throw new Error(error.message, { cause: error })
		if (!data || !data.encounterId) return []

		return data.encounterId.mapInfo.mapCombatTiles.map<CombatTile>(tile => ({
			cord: [tile.q, tile.r, tile.s],
			image: tile.image,
			terrainType: tile.terrainType
		}))
	})

export const tabletopMapTilesQueryOptions = (campaignId: number) => queryOptions({
	queryKey: [campaignId, 'tabletop', 'tiles', 'map'],
	queryFn: () => mapTilesLoader({ data: { campaignId } })
})

export function useTabletopMapTiles() {
	const { campaignId } = getRouteApi('/tabletop/$campaignId/gm/').useLoaderData()
	return useSuspenseQuery(tabletopMapTilesQueryOptions(campaignId))
}
