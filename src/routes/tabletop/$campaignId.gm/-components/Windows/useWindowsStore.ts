import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { type Enums } from '~/supabase/databaseTypes'
import { createActionName, type DevTools, type Slice } from '~/types/storeTypes'

type WindowName =
	| 'round'
	| `character-${Enums<'character_type'>}-${number}`

type WindowsState = {
	opened: Record<WindowName, boolean>
}

const windowState = {
	opened: {
		round: false
	}
} satisfies WindowsState

type WindowsAction = {
	toggleWindow: (windowName: WindowName) => void
	/**
	 * If the character is already open, does nothing
	 */
	addCharacter: (characterType: Enums<'character_type'>, tabletopCharacterId: number) => void
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
	},
	addCharacter: (characterType, tabletopCharacterId) => {
		set(state => ({
			opened: {
				[`character-${characterType}-${tabletopCharacterId}`]: false,
				...state.opened
			}
		}), ...actionName('addCharacter'))
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
