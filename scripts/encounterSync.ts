import { adminUUID } from '~/supabase/adminAccount'
import { type TablesInsert } from '~/supabase/databaseTypes'
import { getServiceClient } from '~/supabase/getServiceClient'
import { createCompendiumHash } from './compendiumTypes'
import encounters, { type CompendiumEncounter } from './data/encounters/encounterData'

const supabase = getServiceClient()

async function getEncounterId(encounter: CompendiumEncounter) {
	{
		const { data, error } = await supabase
			.from('compendium_encounter')
			.select('encounter_id')
			.eq('encounter_hash', createCompendiumHash(encounter))
			.limit(1)
			.maybeSingle()
		if (error) throw new Error(error.message, { cause: error })
		if (data) return data.encounter_id
	}

	{
		const mapInfo = await supabase
			.from('compendium_map')
			.select('map_id')
			.eq('map_hash', encounter.mapHash)
			.limit(1)
			.single()
		if (mapInfo.error) throw new Error(mapInfo.error.message, { cause: mapInfo.error })

		const { data, error } = await supabase
			.from('encounter_info')
			.insert({
				user_id: adminUUID,
				encounter_name: encounter.name,
				map_id: mapInfo.data.map_id
			})
			.select('encounter_id')
			.limit(1)
			.single()
		if (error) throw new Error(error.message, { cause: error })
		return data.encounter_id
	}
}

for (const encounter of encounters) {
	const encounterId = await getEncounterId(encounter)
	const hash = createCompendiumHash(encounter)

	{
		const { error } = await supabase
			.from('encounter_tile')
			.delete()
			.eq('encounter_id', encounterId)
		if (error) throw new Error(error.message, { cause: error })
	}

	{
		const { error } = await supabase
			.from('compendium_encounter')
			.upsert({
				encounter_id: encounterId,
				encounter_hash: hash,
				encounter_source: encounter.source
			})
			.eq('encounter_hash', hash)
		if (error) throw new Error(error.message, { cause: error })
	}

	const enemyHashList = encounter.tiles.map(tile => tile.enemyHash)

	const enemyList = await supabase
		.from('compendium_enemy')
		.select(`
			enemyId: enemy_id,
			enemyHash: enemy_hash
		`)
		.in('enemy_hash', enemyHashList)
	if (enemyList.error) throw new Error(enemyList.error.message, { cause: enemyList.error })

	{
		const { error } = await supabase
			.from('encounter_tile')
			.insert(encounter.tiles.map(tile => {
				const enemyId = enemyList.data.find(enemy => enemy.enemyHash === tile.enemyHash)?.enemyId
				if (!enemyId) throw new Error('Invalid enemy data')
				return {
					encounter_id: encounterId,
					q: tile.cord[0],
					r: tile.cord[1],
					s: tile.cord[2],
					enemy_id: enemyId
				} satisfies TablesInsert<'encounter_tile'>
			}))
		if (error) throw new Error(error.message, { cause: error })
	}
	console.log(`Synced Encounter: ${hash}`)
}
