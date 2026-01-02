import { type Archetype, type DamageType, type Subarchetype } from '../DamageType'
import { type RuneData, type RuneDataInternal } from './runeData'

export const runeDataFormatter = <T extends DamageType>(runesData: RuneDataInternal[], damageType: T, archetype: Archetype<T>, subarchetype: Subarchetype<T, Archetype<T>>) => {
	return runesData.map(rune => ({
		name: rune.name,
		description: rune.description,
		slot: rune.slot,
		durability: rune.durability,
		damageType: damageType.toUpperCase(),
		data: rune.data,
		// Both archetype and subarchetype doesn't infer properly so the array is type cast
		archetype,
		subarchetype
	} as RuneData))
}
