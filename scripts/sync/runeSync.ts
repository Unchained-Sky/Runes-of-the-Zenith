import { type TablesInsert } from '~/supabase/databaseTypes'
import { getServiceClient } from '~/supabase/getServiceClient'
import allRunes from '../data/runes/runeData'

const supabase = getServiceClient()

{
	const { error } = await supabase
		.from('rune_info')
		.delete()
		// Supabase doesn't allow delete with a WHERE clause
		.neq('rune_name', '')
	if (error) throw new Error(error.message, { cause: error })
}

{
	const { error } = await supabase
		.from('rune_info')
		.insert(
			allRunes.map<TablesInsert<'rune_info'>>(rune => ({
				rune_name: rune.name,
				slot: rune.slot,
				durability: rune.durability,
				// TODO remove damage_type and archetype and move them into a separate table
				damage_type: rune.damageType,
				archetype: rune.archetype,
				subarchetype: rune.subarchetype,
				data: {
					description: rune.description
				}
			}))
		)
	if (error) throw new Error(error.message, { cause: error })
}
