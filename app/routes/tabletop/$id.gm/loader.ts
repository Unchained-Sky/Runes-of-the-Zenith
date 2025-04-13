import { redirect } from '@remix-run/node'
import { type SupabaseClient } from '@supabase/supabase-js'
import { type CombatTile } from '~/data/mapTemplates/combat'
import { type Database } from '~/supabase/databaseTypes'

export type LoaderOptions = {
	supabase: SupabaseClient<Database>
	headers: Headers
	campaignId: number
	userId: string
}

export async function getCampaignName({ supabase, headers, campaignId, userId }: LoaderOptions) {
	const { data, error } = await supabase
		.from('campaign_info')
		.select('campaignName: campaign_name')
		.eq('campaign_id', campaignId)
		.eq('user_id', userId)
	if (error || !data.length) throw redirect(`/tabletop/${campaignId}`, { headers })

	return data[0].campaignName
}

export async function getTiles({ supabase, headers, campaignId }: LoaderOptions) {
	const { data, error } = await supabase
		.from('tabletop_info')
		.select(`
			mapInfo: map_info(
				mapCombatTile: map_combat_tile(
					q,
					r,
					s,
					image,
					terrainType: terrain_type
				)
			)
		`)
		.eq('campaign_id', campaignId)
	if (error) throw redirect(`/campaign/${campaignId}`, { headers })

	if (!data.length) return []

	return data[0].mapInfo.mapCombatTile.map<CombatTile>(tile => ({
		cord: [tile.q, tile.r, tile.s],
		image: tile.image,
		terrainType: tile.terrainType
	}))
}

export async function getMaps({ supabase, headers, campaignId, userId }: LoaderOptions) {
	const { data, error } = await supabase
		.from('map_info')
		.select(`
			mapId:map_id,
			name,
			mapCombatTile: map_combat_tile(count)
		`)
		.eq('user_id', userId)
	if (error) throw redirect(`/campaign/${campaignId}`, { headers })

	const out = data.filter(map => map.mapCombatTile[0].count > 0)

	return out.map(map => ({ mapId: map.mapId, name: map.name }))
}

export async function getCharacters({ supabase, headers, campaignId }: LoaderOptions) {
	const { data, error } = await supabase
		.from('character_info')
		.select(`
			character_id,
			character_name,
			tabletop_characters(
				shield_durability,
				shield_current,
				shield_max,
				health_current,
				health_max
			)
		`)
		.eq('campaign_id', campaignId)
	if (error) throw redirect(`/campaign/${campaignId}`, { headers })

	return data
}
