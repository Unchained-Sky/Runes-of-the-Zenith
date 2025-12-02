import { adminUUID } from '~/supabase/adminAccount'
import { getServiceClient } from '~/supabase/getServiceClient'
import { createCompendiumHash } from './compendiumTypes'
import enemyData, { type CompendiumEnemy } from './data/enemies/enemyData'

const supabase = getServiceClient()

async function insertEnemy(enemy: CompendiumEnemy) {
	const characterInfo = await supabase
		.from('character_info')
		.insert({
			character_type: 'ENEMY',
			max_health: enemy.stats.maxHealth,
			max_shield: enemy.stats.shield,
			int: enemy.stats.int,
			str: enemy.stats.str,
			dex: enemy.stats.dex,
			max_movement: enemy.stats.movement,
			crit_chance: enemy.stats.critChance
		})
		.select('character_id')
		.limit(1)
		.single()
	if (characterInfo.error) throw new Error(characterInfo.error.message, { cause: characterInfo.error })

	const enemyInfo = await supabase
		.from('enemy_info')
		.insert({
			user_id: adminUUID,
			enemy_name: enemy.name,
			character_id: characterInfo.data.character_id
		})
		.select('enemy_id')
		.limit(1)
		.single()
	if (enemyInfo.error) throw new Error(enemyInfo.error.message, { cause: enemyInfo.error })

	return enemyInfo.data.enemy_id
}

async function updateEnemy(enemy: CompendiumEnemy, enemyId: number, characterId: number) {
	const enemyInfo = await supabase
		.from('enemy_info')
		.update({
			user_id: adminUUID,
			enemy_name: enemy.name,
			character_id: characterId
		})
		.eq('enemy_id', enemyId)
		.select('enemy_id')
		.limit(1)
		.single()
	if (enemyInfo.error) throw new Error(enemyInfo.error.message, { cause: enemyInfo.error })

	const characterInfo = await supabase
		.from('character_info')
		.update({
			max_health: enemy.stats.maxHealth,
			shield: enemy.stats.shield,
			int: enemy.stats.int,
			str: enemy.stats.str,
			dex: enemy.stats.dex,
			movement: enemy.stats.movement,
			crit_chance: enemy.stats.critChance
		})
		.eq('character_id', characterId)
		.select('character_id')
		.limit(1)
		.single()
	if (characterInfo.error) throw new Error(characterInfo.error.message, { cause: characterInfo.error })

	return enemyInfo.data.enemy_id
}

for (const enemy of enemyData) {
	const hash = createCompendiumHash(enemy)

	const { data, error } = await supabase
		.from('compendium_enemy')
		.select(`
			enemy_id,
			enemy_info (
				character_id
			)
		`)
		.eq('enemy_hash', hash)
		.limit(1)
		.maybeSingle()
	if (error) throw new Error(error.message, { cause: error })

	const enemyId = data?.enemy_id && data.enemy_info
		? await updateEnemy(enemy, data.enemy_id, data.enemy_info.character_id)
		: await insertEnemy(enemy)

	{
		const { error } = await supabase
			.from('compendium_enemy')
			.upsert({
				enemy_hash: hash,
				enemy_id: enemyId,
				enemy_source: enemy.source
			})
			.eq('enemy_hash', hash)
		if (error) throw new Error(error.message, { cause: error })
	}
	console.log(`Synced ${hash}`)
}
