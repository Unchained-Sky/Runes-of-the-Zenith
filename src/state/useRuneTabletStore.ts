import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { getTabletShape } from '~/data/tablet'
import { createActionName, persistStoreName, type Slice } from './storeTypes'

type TabletSquareData = 'X' | ' '

type RuneTabletState = {
	tablet: TabletSquareData[][]
}

const runeTabletState: RuneTabletState = {
	tablet: []
}

type RuneTabletActions = {
	setSize: (level: number) => void
	updateSquare: (rowIndex: number, columnIndex: number, data: TabletSquareData) => void
}

const actionName = createActionName<RuneTabletActions>('runetablet')

const createRuneTabletActions: Slice<RuneTabletStore, RuneTabletActions> = (set, get) => ({
	setSize: level => {
		const shape = getTabletShape(level)
		set({ tablet: shape }, ...actionName('setSize'))
	},

	updateSquare: (rowIndex, columnIndex, data) => {
		const { tablet } = get()
		tablet[rowIndex][columnIndex] = data
		set({ tablet }, ...actionName('updateSquare'))
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
