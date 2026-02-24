import { type RuneDataInternal } from '../../runeData'
import { runeDataFormatter } from '../../runeFormatter'

const astralRunes = [
	{
		name: 'astral-1',
		description: 'Astral Rune 1',
		slot: 'PRIMARY',
		durability: 'REINFORCED',
		data: {
			damage: {
				damageType: { int: { flat: 40, scale: 20 } },
				accuracy: 50,
				resolve: 4
			}
		}
	},
	{
		name: 'astral-2',
		description: 'Astral Rune 2',
		slot: 'SECONDARY',
		durability: 'REINFORCED',
		data: {
			damage: {
				damageType: { int: { flat: 50, scale: 30 } },
				accuracy: 50,
				resolve: 4
			}
		}
	},
	{
		name: 'astral-3',
		description: 'Astral Rune 3',
		slot: 'PASSIVE',
		durability: null,
		data: {}
	},
	{
		name: 'astral-4',
		description: 'Astral Rune 4',
		slot: 'PRIMARY',
		durability: 'UNSTABLE',
		data: {
			damage: {
				damageType: { int: { flat: 80, scale: 50 } },
				accuracy: 20,
				resolve: 4
			}
		}
	},
	{
		name: 'astral-5',
		description: 'Astral Rune 5',
		slot: 'SECONDARY',
		durability: 'FRAGILE',
		data: {
			damage: {
				damageType: { int: { flat: 100, scale: 100 } },
				accuracy: 50,
				resolve: 4
			}
		}
	},
	{
		name: 'astral-6',
		description: 'Astral Rune 6',
		slot: 'PRIMARY',
		durability: 'STABLE',
		data: {
			damage: {
				damageType: { int: { flat: 200, scale: 120 } },
				accuracy: 80,
				resolve: 4
			}
		}
	}
] satisfies RuneDataInternal[]

export default runeDataFormatter(astralRunes, 'intelligence', 'arcane', 'astral')
