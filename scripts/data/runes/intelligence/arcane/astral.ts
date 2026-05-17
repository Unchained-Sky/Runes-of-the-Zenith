import { type RuneDataInternal } from '../../runeData'
import { runeDataFormatter } from '../../runeFormatter'

const astralRunes = [
	{
		name: 'astral-1',
		description: 'Astral Rune 1',
		slot: 'PRIMARY',
		durability: 'REINFORCED',
		resolve: 4,
		effect: [{
			range: 3,
			damage: {
				mainStats: { int: { flat: 40, scale: 20 } },
				accuracy: 50
			},
			target: { characterType: 'ENEMY', selectType: 'CHARACTER', amount: 1 }
		}]
	},
	{
		name: 'astral-2',
		description: 'Astral Rune 2',
		slot: 'SECONDARY',
		durability: 'REINFORCED',
		resolve: 4,
		effect: [
			{
				range: 1,
				damage: {
					mainStats: { int: { flat: 50, scale: 30 } },
					accuracy: 50
				},
				target: { characterType: 'ALLY', selectType: 'CHARACTER', amount: 2 }
			},
			{
				range: 2,
				damage: {
					mainStats: { int: { flat: 50, scale: 30 } },
					accuracy: 50
				},
				target: { characterType: 'ALLY', selectType: 'TILE', amount: 1 }
			}
		]
	},
	{
		name: 'astral-3',
		description: 'Astral Rune 3',
		slot: 'PASSIVE',
		durability: 'REINFORCED',
		resolve: 0,
		effect: [{
			target: { characterType: 'SELF', selectType: 'CHARACTER', amount: 1 }
		}]
	},
	{
		name: 'astral-4',
		description: 'Astral Rune 4',
		slot: 'PRIMARY',
		durability: 'UNSTABLE',
		resolve: 4,
		effect: [{
			range: 2,
			damage: {
				mainStats: { int: { flat: 80, scale: 50 } },
				accuracy: 20
			},
			target: { characterType: 'ENEMY', selectType: 'AREA', amount: 2 }
		}]
	},
	{
		name: 'astral-5',
		description: 'Astral Rune 5',
		slot: 'SECONDARY',
		durability: 'FRAGILE',
		resolve: 4,
		effect: [{
			range: 4,
			damage: {
				mainStats: { int: { flat: 100, scale: 100 } },
				accuracy: 50
			},
			target: { characterType: 'ALL', selectType: 'TILE', amount: 1 }
		}]
	},
	{
		name: 'astral-6',
		description: 'Astral Rune 6',
		slot: 'PRIMARY',
		durability: 'STABLE',
		resolve: 4,
		effect: [{
			damage: {
				mainStats: { int: { flat: 200, scale: 120 } },
				accuracy: 80
			},
			target: { characterType: 'ENEMY', selectType: 'TILE', amount: 3 }
		}]
	}
] satisfies RuneDataInternal[]

export default runeDataFormatter(astralRunes, 'ASTRAL')
