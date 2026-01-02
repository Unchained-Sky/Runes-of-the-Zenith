import { type RuneDataInternal } from '../../runeData'
import { runeDataFormatter } from '../../runeFormatter'

const astralRunes = [
	{
		name: 'astral-1',
		description: 'Astral Rune 1',
		slot: 'PRIMARY',
		durability: 'REINFORCED',
		data: {}
	},
	{
		name: 'astral-2',
		description: 'Astral Rune 2',
		slot: 'SECONDARY',
		durability: 'REINFORCED',
		data: {}
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
		data: {}
	},
	{
		name: 'astral-5',
		description: 'Astral Rune 5',
		slot: 'SECONDARY',
		durability: 'FRAGILE',
		data: {}
	},
	{
		name: 'astral-6',
		description: 'Astral Rune 6',
		slot: 'PRIMARY',
		durability: 'STABLE',
		data: {}
	}
] satisfies RuneDataInternal[]

export default runeDataFormatter(astralRunes, 'intelligence', 'arcane', 'astral')
