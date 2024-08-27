export type TabletSize = {
	level: number
	shape: (' ' | 'X')[][]
}

const tableSize: TabletSize[] = [
	{
		level: 1,
		shape: [
			['X', 'X'],
			['X', 'X']
		]
	},
	{
		level: 2,
		shape: [
			['X', ' '],
			['X', 'X'],
			['X', 'X']
		]
	},
	{
		level: 3,
		shape: [
			['X', 'X'],
			['X', 'X'],
			['X', 'X']
		]
	},
	{
		level: 4,
		shape: [
			['X', 'X', ' '],
			['X', 'X', ' '],
			['X', 'X', 'X']
		]
	},
	{
		level: 5,
		shape: [
			['X', 'X', ' '],
			['X', 'X', 'X'],
			['X', 'X', 'X']
		]
	},
	{
		level: 6,
		shape: [
			['X', 'X', 'X'],
			['X', 'X', 'X'],
			['X', 'X', 'X']
		]
	}
]

export default tableSize
