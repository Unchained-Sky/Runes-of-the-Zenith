import { getServiceClient } from '~/supabase/getServiceClient'
import allRunes from '../data/runes/runeData'

const supabase = getServiceClient()

{
	const { error, count } = await supabase
		.from('rune_info')
		.delete({ count: 'exact' })
		.not('rune_name', 'in', `(${allRunes.map(rune => rune.name).join(',')})`)
	if (error) throw new Error(error.message, { cause: error })

	if (count) {
		console.log(`Deleted ${count} rune${count === 1 ? '' : 's'}`)
	}
}

{
	for (const rune of allRunes) {
		const { error } = await supabase
			.from('rune_info')
			.upsert({
				rune_name: rune.name,
				slot: rune.slot,
				durability: rune.durability,
				// TODO remove damage_type and archetype and move them into a separate table
				damage_type: rune.damageType,
				archetype: rune.archetype,
				subarchetype: rune.subarchetype,
				data: rune.data
			})
			.eq('rune_name', rune.name)
		if (error) throw new Error(error.message, { cause: error })
	}
}

console.log(`Synced ${allRunes.length} runes`)
