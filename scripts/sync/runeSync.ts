import { getServiceClient } from '~/supabase/getServiceClient'
import allRunes from '../data/runes/runeData'

const supabase = getServiceClient()

{
	const { error, count } = await supabase
		.from('rune_info')
		.delete({ count: 'exact' })
		.not('rune_name', 'in', `(${allRunes.map(rune => rune.rune_name).join(',')})`)
	if (error) throw new Error(error.message, { cause: error })

	if (count) {
		console.log(`Deleted ${count} rune${count === 1 ? '' : 's'}`)
	}
}

{
	for (const rune of allRunes) {
		const { error } = await supabase
			.from('rune_info')
			.upsert(rune)
			.eq('rune_name', rune.rune_name)
		if (error) throw new Error(error.message, { cause: error })
	}
}

console.log(`Synced ${allRunes.length} runes`)
