export type Rune = {
	colour: string
	shape: (' ' | 'X')[][]
}

const runes: Rune[] = [
	{
		colour: 'red',
		shape: [
			['X', 'X', 'X'],
			[' ', ' ', 'X']
		]
	},
	{
		colour: 'blue',
		shape: [
			['X', 'X', ' '],
			[' ', 'X', 'X']
		]
	},
	{
		colour: 'green',
		shape: [
			['X', 'X', 'X', 'X'],
			[' ', ' ', 'X', ' ']
		]
	},
	{
		colour: 'purple',
		shape: [
			['X', 'X', 'X'],
			[' ', ' ', 'X'],
			[' ', ' ', 'X'],
			[' ', ' ', 'X'],
			[' ', 'X', 'X']
		]
	}
] as const

export default runes
