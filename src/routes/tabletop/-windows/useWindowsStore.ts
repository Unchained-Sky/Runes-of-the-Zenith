import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { type Enums } from '~/supabase/databaseTypes'
import { createActionName, type DevTools, type Slice } from '~/types/storeTypes'

type WindowName =
	| 'round'
	| 'damageSimulation'
	| `character-${Enums<'character_type'>}-${number}`

type WindowsState = {
	opened: Record<WindowName, boolean>
}

const windowState = {
	opened: {
		round: false,
		damageSimulation: false
	}
} satisfies WindowsState

type WindowsAction = {
	toggleWindow: (windowName: WindowName) => void
}

const actionName = createActionName<WindowsAction>('windows')

const createWindowActions: Slice<WindowsStore, WindowsAction, [DevTools]> = (set, _get) => ({
	toggleWindow: windowName => {
		set(state => ({
			opened: {
				...state.opened,
				[windowName]: !state.opened[windowName]
			}
		}), ...actionName('toggleWindow'))
	}
})

type WindowsStore = WindowsState & WindowsAction

export const useWindowsStore = create<WindowsStore>()(
	devtools(
		(...a) => ({
			...windowState,
			...createWindowActions(...a)
		}),
		{ name: 'Windows Store' }
	)
)
