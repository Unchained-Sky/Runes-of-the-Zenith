import { type TablesInsert } from '~/supabase/databaseTypes'
import { getServiceClient } from '~/supabase/getServiceClient'
import { adminUUID } from '../src/supabase/adminAccount'
import { createCompendiumHash } from './compendiumTypes'
import combatMaps, { type CompendiumCombatMap } from './data/maps/combat/combatMapData'

const supabase = getServiceClient()

async function getMapId(combatMap: CompendiumCombatMap) {
	{
		const { data, error } = await supabase
			.from('compendium_map')
			.select('map_id')
			.eq('map_hash', createCompendiumHash(combatMap))
			.limit(1)
			.maybeSingle()
		if (error) throw new Error(error.message, { cause: error })
		if (data) return data.map_id
	}

	{
		const { data, error } = await supabase
			.from('map_info')
			.insert({
				map_type: 'COMBAT',
				map_name: combatMap.name,
				user_id: adminUUID
			})
			.select('map_id')
			.limit(1)
			.single()
		if (error) throw new Error(error.message, { cause: error })
		return data.map_id
	}
}

for (const combatMap of combatMaps) {
	const mapId = await getMapId(combatMap)
	const hash = createCompendiumHash(combatMap)

	{
		const { error } = await supabase
			.from('map_combat_tile')
			.delete()
			.eq('map_id', mapId)
		if (error) throw new Error(error.message, { cause: error })
	}

	{
		const { error } = await supabase
			.from('compendium_map')
			.upsert({
				map_id: mapId,
				map_hash: hash,
				map_source: combatMap.source
			})
			.eq('map_hash', hash)
		if (error) throw new Error(error.message, { cause: error })
	}

	{
		const { error } = await supabase
			.from('map_combat_tile')
			.insert(combatMap.tiles.map(tile => {
				return {
					map_id: mapId,
					q: tile.cord[0],
					r: tile.cord[1],
					s: tile.cord[2],
					image: tile.image,
					terrain_type: tile.terrainType
				} satisfies TablesInsert<'map_combat_tile'>
			}))
		if (error) throw new Error(error.message, { cause: error })
	}
	console.log(`Synced Map: ${hash}`)
}
