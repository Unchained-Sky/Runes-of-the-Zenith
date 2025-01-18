import { type NodeCategories, type NodeCategory } from '~/scripts/data/skills/skillFormatter'

type CategoryKey<T extends NodeCategory = NodeCategory> = {
	[K in T]: `${K}-${NodeCategories[K]}`
}[T]

export type RuneData = RuneInternal<RuneName>

export type RuneName = (typeof runeArray)[number]['name']

type RuneInternal<T extends string = string> = {
	name: T
	category: CategoryKey
	colour: string
	shape: (' ' | 'X')[][]
}

const runeArray = [
	{
		name: 'one',
		category: 'agility-movement',
		colour: 'red',
		shape: [
			['X', 'X', 'X'],
			[' ', ' ', 'X']
		]
	},
	{
		name: 'two',
		category: 'bloodthirst-bloodthirst',
		colour: 'blue',
		shape: [
			['X', 'X', ' '],
			[' ', 'X', 'X']
		]
	},
	{
		name: 'three',
		category: 'elemental-fire',
		colour: 'green',
		shape: [
			['X', 'X', 'X', 'X'],
			[' ', ' ', 'X', ' '],
			[' ', ' ', 'X', ' ']
		]
	},
	{
		name: 'four',
		category: 'shadow-hellfire',
		colour: 'purple',
		shape: [
			['X', 'X', 'X'],
			[' ', ' ', 'X'],
			[' ', ' ', 'X'],
			[' ', ' ', 'X'],
			[' ', 'X', 'X']
		]
	},
	{
		name: 'five',
		category: 'elemental-earth',
		colour: 'yellow',
		shape: [
			[' ', 'X', ' ', 'X'],
			[' ', 'X', 'X', 'X'],
			['X', 'X', ' ', 'X']
		]
	},
	{
		name: 'six',
		category: 'elemental-earth',
		colour: 'yellow',
		shape: [
			['X', 'X', 'X', 'X'],
			['X', 'X', 'X', 'X'],
			['X', 'X', 'X', 'X']
		]
	},
	{
		name: 'seven',
		category: 'elemental-earth',
		colour: 'yellow',
		shape: [
			['X', 'X', 'X', 'X'],
			['X', ' ', ' ', ' '],
			['X', 'X', 'X', ' ']
		]
	},
	{
		name: 'eight',
		category: 'elemental-earth',
		colour: 'yellow',
		shape: [
			[' ', 'X', ' ', 'X'],
			[' ', 'X', 'X', 'X'],
			['X', 'X', ' ', 'X'],
			['X', ' ', ' ', 'X'],
			['X', ' ', ' ', 'X'],
			['X', 'X', ' ', 'X']
		]
	}
] as const satisfies RuneInternal[]

const runeMap = new Map<RuneName, RuneData>()
runeArray.forEach(rune => runeMap.set(rune.name, rune))

export function getRune(runeName: RuneName) {
	if (!runeMap.has(runeName)) throw new Error(`Rune not found: ${runeName}`)
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	return runeMap.get(runeName)!
}

export function getAllRuneNames() {
	return runeArray.map(({ name }) => name)
}
