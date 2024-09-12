import { getRune, type RuneName } from '~/data/runes'
import { type TabletCords } from '~/RuneTablet/components/Tablet'
import { getTabletShape } from '~/RuneTablet/utils/getTableSize'
import { createActionName, type Slice } from '~/utils/storeTypes'
import { typedObject } from '~/utils/typedObject'
import { type RuneTabletActions, type RuneTabletSquareData, type RuneTabletStore } from './useRuneTabletStore'

export type TabletActions = {
	setSize: (level: number) => void
	placeRune: (runeName: RuneName, tabletCords: TabletCords) => void
	removeRune: (runeName: RuneName) => void
	/** Should only be used within the store */
	updateSquare: (tabletCords: TabletCords, data: Partial<RuneTabletSquareData>, action: keyof RuneTabletActions) => void
}

const actionName = createActionName<TabletActions>('runetablet')

export const createTabletActions: Slice<RuneTabletStore, TabletActions> = (set, get) => ({
	setSize: level => {
		const tablet = getTabletShape(level).map(row => row.map<RuneTabletSquareData>(square => ({
			state: square
		})))
		set({ tablet }, ...actionName('setSize'))

		const { runes, updateRuneState } = get()
		typedObject.entries(runes).forEach(([runeName, _runeState]) => {
			updateRuneState(runeName, { state: 'pouch' }, 'setSize')
		})
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
				return tablet[x][y]?.state === 'X'
			})
		})
		if (!isClear) return

		const { updateSquare } = get()
		runeData.shape.forEach((row, rowIndex) => {
			row.forEach((square, columnIndex) => {
				if (square === ' ') return
				const x = rowIndex + tabletSquareRootCords.x
				const y = columnIndex + tabletSquareRootCords.y
				updateSquare({ x, y }, { state: runeName }, 'placeRune')
			})
		})

		get().updateRuneState(runeName, { state: 'slotted', data: tabletSquareRootCords }, 'placeRune')
	},

	removeRune: runeName => {
		const runeState = get().runes[runeName]
		if (runeState?.state !== 'slotted') return

		const { updateSquare } = get()
		const runeShape = getRune(runeName).shape
		runeShape.forEach((row, rowIndex) => {
			row.forEach((square, columnIndex) => {
				if (square === ' ') return
				const x = rowIndex + runeState.data.x
				const y = columnIndex + runeState.data.y
				updateSquare({ x, y }, { state: 'X' }, 'removeRune')
			})
		})
	},

	updateSquare: ({ x, y }, data, action) => {
		const { tablet } = get()
		tablet[x][y] = Object.assign(tablet[x][y], data)
		set({ tablet }, ...actionName(`updateSquare/${action}`))
	}
})
