import { type } from 'arktype'
import { type RuneData } from '~/scripts/data/runes/runeData'
import { type Json } from '../databaseTypes'

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

const runeExtraDataSchema = type({
	description: 'string',
	resolve: 'number',
	effect: runeEffectSchema.array()
})

export const runeExtraDataFormatter = (rune: { runeInfo: Omit<RuneData, 'data'> & { data: Json } }) => {
	const out = runeExtraDataSchema(rune.runeInfo.data)
	if (out instanceof type.errors) {
		throw console.error(out.summary)
	}

	return {
		...rune.runeInfo,
		data: out
	} satisfies RuneData
}

export type RuneExtraData = typeof runeExtraDataSchema.infer
