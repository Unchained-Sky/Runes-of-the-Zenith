import { type RuneExtraData } from '~/routes/tabletop/$campaignId.gm/-hooks/tabletopData/useTabletopHeroes'
import { type Archetype, type DamageType, type Subarchetype } from '../DamageType'
import astral from './intelligence/arcane/astral'

type RuneDurability = 'REINFORCED' | 'STABLE' | 'UNSTABLE' | 'FRAGILE'

type RuneSlotDurability = {
	slot: 'PRIMARY'
	durability: RuneDurability
} | {
	slot: 'SECONDARY'
	durability: RuneDurability
} | {
	slot: 'PASSIVE'
	durability: null
}

export type RuneDataInternal = {
	name: string
	description: string
	data: Omit<RuneExtraData, 'description'>
} & RuneSlotDurability

export type RuneData<T extends DamageType = DamageType> = T extends DamageType ? {
	damageType: Uppercase<T>
	archetype: Archetype<T>
	/**
	 * The inference doesn't work perfectly here, it lists all possible subarchetypes for the damage type
	 */
	subarchetype: Subarchetype<T, Archetype<T>>
} & RuneDataInternal : never

const allRunes = [
	astral
].flat(1)

export default allRunes
