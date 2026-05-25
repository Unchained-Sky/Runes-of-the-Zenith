import { type RuneData, type RuneDataInternal } from '~/scripts/data/runes/runeData'
import { runeDataFormatter } from '~/scripts/data/runes/runeFormatter'
import { typedObject } from '~/types/typedObject'

const baseRunes = [
	{
		name: 'Basic Attack',
		description: 'Basic Attack an enemy',
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
		description: 'Inspire an ally on the ground back up',
		slot: 'PRIMARY',
		durability: 'REINFORCED',
		resolve: 4,
		effect: [{
			range: 1,
			target: { characterType: 'ALLY', selectType: 'CHARACTER', amount: 1 }
		}]
	},
	{
		name: 'Rest',
		description: 'Repair two unstable runes',
		slot: 'PRIMARY',
		durability: 'REINFORCED',
		resolve: 0,
		effect: [{
			target: { characterType: 'SELF', selectType: 'CHARACTER', amount: 1 }
		}]
	},
	{
		name: 'Interact',
		description: 'Interact with a tile',
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
		description: 'Gain movement equal to your movement stat',
		slot: 'SECONDARY',
		durability: 'REINFORCED',
		resolve: 0,
		effect: [{
			target: { characterType: 'SELF', selectType: 'CHARACTER', amount: 1 }
		}]
	},
	{
		name: 'Item',
		description: 'Consume an item or swap your active weapon',
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
