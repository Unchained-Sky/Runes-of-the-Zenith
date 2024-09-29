import { getAllRuneNames, type RuneName } from '~/data/runes'
import { createActionName, type Slice } from '~/types/storeTypes'
import { typedObject } from '~/types/typedObject'
import { type RuneTabletActions, type RuneTabletRuneState, type RuneTabletStore } from './useRuneTabletStore'

export type RuneActions = {
	/** Should only be used within the store */
	updateRuneState: (runeName: RuneName, runeState: RuneTabletRuneState, action: keyof RuneTabletActions) => void
	pickupRune: (runeName: RuneName) => void
	dropRune: (runeName: RuneName) => void

	DEV_FILL_POUCH: () => void
}

const actionName = createActionName<RuneActions>('runetablet')

export const createRuneActions: Slice<RuneTabletStore, RuneActions> = (set, get) => ({
	updateRuneState: (runeName, runeState, action) => {
		set(state => ({
			runes: {
				...state.runes,
				[runeName]: runeState
			}
		}), ...actionName(`updateRuneState/${action}`))
	},

	pickupRune: runeName => {
		const rune = get().runes[runeName]
		if (rune?.state !== 'slotted') return
		get().removeRune(runeName)
		get().updateRuneState(runeName, { state: 'hovering', data: rune.data }, 'pickupRune')
	},

	dropRune: runeName => {
		const rune = get().runes[runeName]
		if (rune?.state !== 'hovering') return
		get().updateRuneState(runeName, { state: 'slotted', data: rune.data }, 'dropRune')
	},

	DEV_FILL_POUCH: () => {
		const allRunes = getAllRuneNames()
		const tabletRunes = typedObject.keys(get().runes)

		const { updateRuneState } = get()

		allRunes.forEach(runeName => {
			if (tabletRunes.includes(runeName)) return
			updateRuneState(runeName, { state: 'pouch' }, 'DEV_FILL_POUCH')
		})
	}
})
