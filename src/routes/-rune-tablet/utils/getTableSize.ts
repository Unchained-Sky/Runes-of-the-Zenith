type TabletData = ' ' | 'X'
type TabletRow = TabletData[]
type TabletShape = TabletRow[]

export type TabletSize = {
	level: number
	shape: TabletShape
}

export function getTabletShape(level: number) {
	const baseSize = ~~Math.sqrt(level + 3)
	const shape = Array.from({ length: baseSize }, _ => {
		return Array.from<unknown, TabletData>({ length: baseSize }, _ => 'X')
	})
	const remainder = (level + 3) - (baseSize * baseSize)

	if (remainder < baseSize) {
		const topRow = new Array<TabletData>(baseSize)
		for (let i = 0; i < baseSize; i++) {
			topRow[i] = i < remainder ? 'X' : ' '
		}
		shape.unshift(topRow)
	} else {
		for (let i = 0; i < baseSize; i++) {
			const square = shape[i]
			if (!square) continue
			square.push(i >= remainder - baseSize ? ' ' : 'X')
		}
		shape.reverse()

		const topRow = new Array<TabletData>(baseSize + 1).fill('X')
		topRow[topRow.length - 1] = ' '
		shape.unshift(topRow)
	}

	return shape
}
