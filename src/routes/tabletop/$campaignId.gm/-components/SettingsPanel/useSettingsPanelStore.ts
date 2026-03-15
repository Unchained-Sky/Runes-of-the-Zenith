import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { type Enums } from '~/supabase/databaseTypes'
import { createActionName, type DevTools, type Slice } from '~/types/storeTypes'

type SettingsPanelState = {
	lastActiveTab: string
	activeTab: string | null
	selectedCharacter: [tabletopCharacterId: number, characterType: Enums<'character_type'>]
}

const settingsPanelState: SettingsPanelState = {
	lastActiveTab: 'units',
	activeTab: null,
	/** TabletopCharacterId */
	selectedCharacter: [0, 'HERO']
}

type SettingsPanelActions = {
	setActiveTab: (tab: string) => void
	closePanel: () => void
	openLastTab: () => void
	selectCharacter: (tabletopCharacterId: number, characterType: Enums<'character_type'>) => void
	deselectCharacter: () => void
}

const actionName = createActionName<SettingsPanelActions>('settingsPanel')

const createSettingsPanelActions: Slice<SettingsPanelStore, SettingsPanelActions, [DevTools]> = (set, get) => ({
	setActiveTab: tab => {
		if (tab === 'character' && !get().selectedCharacter[0]) return
		set({
			activeTab: tab,
			lastActiveTab: tab
		}, ...actionName('setActiveTab'))
	},
	closePanel: () => set({ activeTab: null }, ...actionName('closePanel')),
	openLastTab: () => set({ activeTab: get().lastActiveTab }, ...actionName('openLastTab')),
	selectCharacter: (tabletopCharacterId, characterType) => set({ selectedCharacter: [tabletopCharacterId, characterType] }, ...actionName('selectCharacter')),
	deselectCharacter: () => set({ selectedCharacter: [0, 'HERO'] }, ...actionName('deselectCharacter'))
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
