import { adminUUID } from '~/supabase/adminAccount'
import { type TablesInsert } from '~/supabase/databaseTypes'
import { type EnemyRuneExtraData } from '~/supabase/extraDataFormatter/enemyRuneExtraData'
import { getServiceClient } from '~/supabase/getServiceClient'
import { createCompendiumHash } from '../data/compendiumTypes'
import enemyData from '../data/enemies/enemyData'

const supabase = getServiceClient()

for (const enemy of enemyData) {
	const hash = createCompendiumHash(enemy)

	const compendiumEnemy = await supabase
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
	if (compendiumEnemy.error) throw new Error(compendiumEnemy.error.message, { cause: compendiumEnemy.error })

	const characterInfo = await supabase
		.from('character_info')
		.upsert({
			character_id: compendiumEnemy.data?.enemy_info?.character_id ?? undefined,
			character_type: 'ENEMY',
			max_health: enemy.stats.maxHealth,
			max_shield: enemy.stats.shield,
			int: enemy.stats.int,
			str: enemy.stats.str,
			dex: enemy.stats.dex,
			max_movement: enemy.stats.movement,
			crit_chance: enemy.stats.critChance,
			int_def: enemy.stats.intDef,
			str_def: enemy.stats.strDef,
			dex_def: enemy.stats.dexDef
		} satisfies TablesInsert<'character_info'>, {
			onConflict: 'character_id'
		})
		.select('character_id')
		.limit(1)
		.single()
	if (characterInfo.error) throw new Error(characterInfo.error.message, { cause: characterInfo.error })

	const enemyInfo = await supabase
		.from('enemy_info')
		.upsert({
			enemy_id: compendiumEnemy.data?.enemy_id ?? undefined,
			user_id: adminUUID,
			enemy_name: enemy.name,
			character_id: characterInfo.data.character_id,
			aggression: enemy.stats.aggression
		} satisfies TablesInsert<'enemy_info'>, {
			onConflict: 'enemy_id'
		})
		.select('enemy_id')
		.limit(1)
		.single()
	if (enemyInfo.error) throw new Error(enemyInfo.error.message, { cause: enemyInfo.error })

	{
		const { error } = await supabase
			.from('compendium_enemy')
			.upsert({
				enemy_hash: hash,
				enemy_id: enemyInfo.data.enemy_id,
				enemy_source: enemy.source
			})
			.eq('enemy_hash', hash)
		if (error) throw new Error(error.message, { cause: error })
	}

	{
		const { error } = await supabase
			.from('enemy_rune_info')
			.delete()
			.eq('enemy_id', enemyInfo.data.enemy_id)
		if (error) throw new Error(error.message, { cause: error })
	}

	{
		for (const rune of enemy.runes) {
			const { error } = await supabase
				.from('enemy_rune_info')
				.insert({
					enemy_id: enemyInfo.data.enemy_id,
					rune_name: rune.name,
					slot: rune.slot,
					data: {
						description: rune.description,
						effect: rune.effect
					} satisfies EnemyRuneExtraData
				} satisfies TablesInsert<'enemy_rune_info'>)
			if (error) throw new Error(error.message, { cause: error })
		}
	}

	console.log(`Synced ${hash}`)
}
