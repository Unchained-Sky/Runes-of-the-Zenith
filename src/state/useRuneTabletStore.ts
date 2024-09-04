import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { type TabletCords } from '~/components/RuneTablet/Tablet'
import { getRune, type RuneName } from '~/data/runes'
import { getTabletShape } from '~/utils/getTableSize'
import { createActionName, persistStoreName, type Slice } from './storeTypes'

type TabletSquareData = 'X' | ' ' | RuneName

type RuneTabletState = {
	tablet: TabletSquareData[][]
}

const runeTabletState: RuneTabletState = {
	tablet: []
}

type RuneTabletActions = {
	setSize: (level: number) => void
	placeRune: (runeName: RuneName, tabletCords: TabletCords) => void
	/** Should only be used within the store */
	updateSquare: (tabletCords: TabletCords, data: TabletSquareData, action: keyof RuneTabletActions) => void
}

const actionName = createActionName<RuneTabletActions>('runetablet')

const createRuneTabletActions: Slice<RuneTabletStore, RuneTabletActions> = (set, get) => ({
	setSize: level => {
		const shape = getTabletShape(level)
		set({ tablet: shape }, ...actionName('setSize'))
	},

	placeRune: (runeName, tabletSquareRootCords) => {
		const runeData = getRune(runeName)

		const runeHeight = runeData.shape.length
		if (tabletSquareRootCords.x + runeHeight > get().tablet.length) return

		const runeWidth = runeData.shape[0].length
		const row = get().tablet[tabletSquareRootCords.x].filter(data => data !== ' ')
		if (tabletSquareRootCords.y + runeWidth > row.length) return

		runeData.shape.forEach((row, rowIndex) => {
			row.forEach((square, columnIndex) => {
				if (square === ' ') return
				const x = rowIndex + tabletSquareRootCords.x
				const y = columnIndex + tabletSquareRootCords.y
				get().updateSquare({ x, y }, runeName, 'placeRune')
			})
		})
	},

	updateSquare: ({ x, y }, data, action) => {
		const { tablet } = get()
		tablet[x][y] = data
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
