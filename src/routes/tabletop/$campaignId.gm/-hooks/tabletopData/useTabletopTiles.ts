import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { type } from 'arktype'
import { requireAccount } from '~/supabase/requireAccount'
import { typedObject } from '~/types/typedObject'

const tilesLoaderSchema = type({
	campaignId: 'number'
})

const tilesLoader = createServerFn({ method: 'GET' })
	.validator(tilesLoaderSchema)
	.handler(async ({ data: { campaignId } }) => {
		const { supabase } = await requireAccount({ backlink: '/campaigns' })

		const { data, error } = await supabase
			.from('tabletop_tiles')
			.select(`
				q,
				r,
				s,
				character: tabletop_characters (
					tabletopCharacterId: tt_character_id,
					characterType: character_type
				)
			`)
			.eq('campaign_id', campaignId)
		if (error) throw new Error(error.message, { cause: error })

		return typedObject.fromEntries(data.map(tile => [
			`${tile.q},${tile.r},${tile.s}` as const,
			tile.character
				? {
					tabletopCharacterId: tile.character.tabletopCharacterId,
					characterType: tile.character.characterType
				}
				: null
		]))
	})

export const tabletopTilesQueryOptions = (campaignId: number) => queryOptions({
	queryKey: [campaignId, 'tabletop', 'tiles', 'characters'],
	queryFn: () => tilesLoader({ data: { campaignId } })
})

export function useTabletopTiles() {
	const { campaignId } = getRouteApi('/tabletop/$campaignId/gm/').useLoaderData()
	return useSuspenseQuery(tabletopTilesQueryOptions(campaignId))
}
