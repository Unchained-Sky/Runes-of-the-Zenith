import { type } from 'arktype'
import { type Enums } from '~/supabase/databaseTypes'
import astral from './intelligence/arcane/astral'

const powerValues = type({
	flat: 'number',
	scale: 'number'
})

const damageHealing = type({
	mainStats: type({
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
	}),
	accuracy: 'number'
})

export const runeEffectSchema = type({
	'range?': 'number',
	'aoe?': 'number',
	'damage?': damageHealing,
	'healing?': damageHealing,
	'target': {
		// TODO add target description
		characterType: type('"ENEMY" | "HERO" | "ALLY" | "ALL" | "SELF" | "NONE"'), // TODO Summon?,
		selectType: type('"CHARACTER" | "AREA" | "TILE" | "NONE"'),
		amount: 'number'
	}
})
export type RuneEffectData = typeof runeEffectSchema.infer

export type RuneDataInternal = {
	name: string
	description: string
	resolve: number
	effect: RuneEffectData[]
	slot: Enums<'rune_slot'>
	durability: Enums<'rune_durability'>
}

export const runeExtraDataSchema = type({
	description: 'string',
	resolve: 'number',
	effect: runeEffectSchema.array()
})

export type RuneData = {
	name: string
	subarchetype: Enums<'subarchetype'>
	slot: Enums<'rune_slot'>
	durability: Enums<'rune_durability'>
	data: typeof runeExtraDataSchema.infer
}

const allRunes = [
	astral
].flat(1)

export default allRunes
