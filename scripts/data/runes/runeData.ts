import { type } from 'arktype'
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

const powerValues = type({
	flat: 'number',
	scale: 'number'
})

const mainStats = type({
	'int': powerValues,
	'dex?': powerValues,
	'str?': powerValues
}).or({
	'int?': powerValues,
	'dex': powerValues,
	'str?': powerValues
}).or({
	'int?': powerValues,
	'dex?': powerValues,
	'str': powerValues
})

const targetCharacterType = type('"ENEMY" | "HERO" | "ALLY" | "ALL" | "SELF" | "NONE"') // TODO Summon?
const targetSelectType = type('"CHARACTER" | "AREA" | "TILE" | "NONE"')

const damageHealing = type({
	mainStats,
	resolve: 'number',
	accuracy: 'number'
})

export const runeExtraDataSchema = type({
	'description': 'string',
	'range?': 'number',
	'damage?': damageHealing,
	'healing?': damageHealing,
	'target': {
		characterType: targetCharacterType,
		selectType: targetSelectType,
		amount: 'number'
	}
})
export type RuneExtraData = typeof runeExtraDataSchema.infer

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
} & Omit<RuneDataInternal, 'description'> & { data: RuneDataInternal['data'] & { description: string } } : never

const allRunes = [
	astral
].flat(1)

export default allRunes
