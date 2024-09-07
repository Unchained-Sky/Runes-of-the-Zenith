import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { type TabletCords } from '~/components/RuneTablet/Tablet'
import { getRune, type RuneName } from '~/data/runes'
import { getTabletShape } from '~/utils/getTableSize'
import { createActionName, persistStoreName, type Slice } from './storeTypes'

type TabletSquareData = {
	state: 'X' | ' ' | RuneName
	runeRoot: RuneName[]
}

type RuneTabletState = {
	tablet: TabletSquareData[][]
}

const runeTabletState: RuneTabletState = {
	tablet: [[]]
}

type RuneTabletActions = {
	setSize: (level: number) => void
	placeRune: (runeName: RuneName, tabletCords: TabletCords) => void
	/** Should only be used within the store */
	updateSquare: (tabletCords: TabletCords, data: Partial<TabletSquareData>, action: keyof RuneTabletActions) => void
}

const actionName = createActionName<RuneTabletActions>('runetablet')

const createRuneTabletActions: Slice<RuneTabletStore, RuneTabletActions> = (set, get) => ({
	setSize: level => {
		const tablet = getTabletShape(level).map(row => row.map<TabletSquareData>(square => ({
			state: square,
			runeRoot: []
		})))
		set({ tablet }, ...actionName('setSize'))
	},

	placeRune: (runeName, tabletSquareRootCords) => {
		const runeData = getRune(runeName)
		const { tablet } = get()

		const runeHeight = runeData.shape.length
		if (tabletSquareRootCords.x + runeHeight > tablet.length) return

		const isClear = runeData.shape.every((row, rowIndex) => {
			return row.every((square, columnIndex) => {
				if (square === ' ') return true
				const x = rowIndex + tabletSquareRootCords.x
				const y = columnIndex + tabletSquareRootCords.y
				return tablet[x][y].state === 'X'
			})
		})
		if (!isClear) return

		const { updateSquare } = get()
		const runeRoot = [
			...get().tablet[tabletSquareRootCords.x][tabletSquareRootCords.y].runeRoot,
			runeName
		]
		updateSquare(tabletSquareRootCords, { runeRoot }, 'placeRune')

		runeData.shape.forEach((row, rowIndex) => {
			row.forEach((square, columnIndex) => {
				if (square === ' ') return
				const x = rowIndex + tabletSquareRootCords.x
				const y = columnIndex + tabletSquareRootCords.y
				updateSquare({ x, y }, { state: runeName }, 'placeRune')
			})
		})
	},

	updateSquare: ({ x, y }, data, action) => {
		const { tablet } = get()
		tablet[x][y] = Object.assign(tablet[x][y], data)
		set({ tablet }, ...actionName(`updateSquare/${action}`))
	}
})

type RuneTabletStore = RuneTabletState & RuneTabletActions

export const useRuneTabletStore = create<RuneTabletStore>()(
	devtools(
		persist(
			(...a) => ({
				...runeTabletState,
				...createRuneTabletActions(...a)
			}),
			{ name: persistStoreName('runetablet') }
		),
		{ name: 'Rune Tablet Store' }
	)
)
