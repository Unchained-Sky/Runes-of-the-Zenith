import { type Enums, type TablesInsert } from '~/supabase/databaseTypes'
import { type RuneDataInternal } from './runeData'

export const runeDataFormatter = (runesData: RuneDataInternal[], subarchetype: Enums<'subarchetype'>) => {
	return runesData.map(rune => ({
		rune_name: rune.name,
		slot: rune.slot,
		durability: rune.durability,
		subarchetype,
		data: {
			description: rune.description,
			resolve: rune.resolve,
			effect: rune.effect
		}
	} satisfies TablesInsert<'rune_info'>))
}
