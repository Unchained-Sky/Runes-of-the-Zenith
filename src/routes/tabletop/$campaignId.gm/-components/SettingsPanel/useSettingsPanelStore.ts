import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { createActionName, type DevTools, type Slice } from '~/types/storeTypes'

type SettingsPanelState = {
	lastActiveTab: string
	activeTab: string | null
}

const settingsPanelState = {
	lastActiveTab: 'units',
	activeTab: null
} satisfies SettingsPanelState

type SettingsPanelActions = {
	setActiveTab: (tab: string) => void
	closePanel: () => void
	openLastTab: () => void
}

const actionName = createActionName<SettingsPanelActions>('settingsPanel')

const createSettingsPanelActions: Slice<SettingsPanelStore, SettingsPanelActions, [DevTools]> = (set, get) => ({
	setActiveTab: tab => {
		set({
			activeTab: tab,
			lastActiveTab: tab
		}, ...actionName('setActiveTab'))
	},
	closePanel: () => set({ activeTab: null }, ...actionName('closePanel')),
	openLastTab: () => set({ activeTab: get().lastActiveTab }, ...actionName('openLastTab'))
})

type SettingsPanelStore = SettingsPanelState & SettingsPanelActions

export const useSettingsPanelStore = create<SettingsPanelStore>()(
	devtools(
		(...a) => ({
			...settingsPanelState,
			...createSettingsPanelActions(...a)
		}),
		{ name: 'Settings Panel Store' }
	)
)
