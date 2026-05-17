import { type RuneData, type RuneDataInternal } from '~/scripts/data/runes/runeData'
import { runeDataFormatter } from '~/scripts/data/runes/runeFormatter'
import { typedObject } from '~/types/typedObject'

const baseRunes = [
	{
		name: 'Basic Attack',
		description: 'Basic Attack',
		slot: 'PRIMARY',
		durability: 'REINFORCED',
		resolve: 0,
		effect: [{
			range: 4,
			damage: {
				mainStats: {
					int: { flat: 5, scale: 50 },
					dex: { flat: 5, scale: 50 },
					str: { flat: 5, scale: 50 }
				},
				accuracy: 75
			},
			target: { characterType: 'ENEMY', selectType: 'CHARACTER', amount: 1 }
		}]
	},
	{
		name: 'Inspire',
		description: 'Inspire',
		slot: 'PRIMARY',
		durability: 'REINFORCED',
		resolve: 0,
		effect: [{
			range: 1,
			target: { characterType: 'ALLY', selectType: 'CHARACTER', amount: 1 }
		}]
	},
	{
		name: 'Rest',
		description: 'Rest',
		slot: 'PRIMARY',
		durability: 'REINFORCED',
		resolve: 0,
		effect: [{
			target: { characterType: 'SELF', selectType: 'CHARACTER', amount: 1 }
		}]
	},
	{
		name: 'Interact',
		description: 'Interact',
		slot: 'SECONDARY',
		durability: 'REINFORCED',
		resolve: 0,
		effect: [{
			range: 1,
			target: { characterType: 'NONE', selectType: 'TILE', amount: 1 }
		}]
	},
	{
		name: 'Rush',
		description: 'Rush',
		slot: 'SECONDARY',
		durability: 'REINFORCED',
		resolve: 0,
		effect: [{
			target: { characterType: 'SELF', selectType: 'CHARACTER', amount: 1 }
		}]
	},
	{
		name: 'Item',
		description: 'Item',
		slot: 'SECONDARY',
		durability: 'REINFORCED',
		resolve: 0,
		effect: [{
			target: { characterType: 'NONE', selectType: 'NONE', amount: 1 }
		}]
	}
] as const satisfies RuneDataInternal[]

type BaseRuneNames = typeof baseRunes[number]['name']

const formatted = runeDataFormatter(baseRunes, 'BASE')

export default typedObject.fromEntries(formatted.map<[BaseRuneNames, RuneData]>(rune => [
	rune.rune_name as BaseRuneNames,
	{
		name: rune.rune_name,
		slot: rune.slot,
		durability: rune.durability,
		subarchetype: rune.subarchetype,
		data: rune.data
	}
]))
