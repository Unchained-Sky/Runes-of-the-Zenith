import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { createActionName, type DevTools, type Slice } from '~/types/storeTypes'

type WindowName = 'round'

type WindowsState = {
	opened: Record<WindowName, boolean>
}

const windowState: WindowsState = {
	opened: {
		round: false
	}
}

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
