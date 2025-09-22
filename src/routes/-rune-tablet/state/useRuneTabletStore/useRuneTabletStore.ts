import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { type RuneName } from '~/data/runes'
import { persistStoreName } from '~/types/storeTypes'
import { type TabletCords } from '../../components/Tablet'
import { createRuneActions, type RuneActions } from './runeActions'
import { createTabletActions, type TabletActions } from './tabletActions'

type RuneState<T extends string, D = unknown> = D extends object ? { state: T, data: D } : { state: T }
export type RuneTabletRuneState =
	| RuneState<'pouch'>
	| RuneState<'slotted', TabletCords>
	| RuneState<'hovering', TabletCords>

export type RuneTabletSquareData = {
	state: 'X' | ' ' | RuneName
}

export type RuneTabletState = {
	runes: Partial<Record<RuneName, RuneTabletRuneState>>
	tablet: RuneTabletSquareData[][]
}

const runeTabletState: RuneTabletState = {
	runes: {},
	tablet: [[]]
}

export type RuneTabletActions = TabletActions & RuneActions

export type RuneTabletStore = RuneTabletState & RuneTabletActions

export const useRuneTabletStore = create<RuneTabletStore>()(
	devtools(
		persist(
			(...a) => ({
				...runeTabletState,
				...createTabletActions(...a),
				...createRuneActions(...a)
			}),
			{ name: persistStoreName('runetablet') }
		),
		{ name: 'Rune Tablet Store' }
	)
)
