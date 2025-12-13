import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { type Enums } from '~/supabase/databaseTypes'
import { createActionName, type DevTools, type Slice } from '~/types/storeTypes'

type SettingsPanelState = {
	lastActiveTab: string
	activeTab: string | null
	selectedCharacter: [tabletopCharacterId: number, characterType: Enums<'character_type'>]
}

const useSettingsPanelState: SettingsPanelState = {
	lastActiveTab: 'units',
	activeTab: null,
	/** TabletopCharacterId */
	selectedCharacter: [0, 'HERO']
}

type SettingsPanelActions = {
	setActiveTab: (tab: string) => void
	closePanel: () => void
	openLastTab: () => void
	openCharacterTab: (tabletopCharacterId: number, characterType: Enums<'character_type'>) => void
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
	openCharacterTab: (tabletopCharacterId, characterType) => {
		set({
			activeTab: 'character',
			selectedCharacter: [tabletopCharacterId, characterType]
		}, ...actionName('openCharacterTab'))
	},
	deselectCharacter: () => {
		set(state => ({
			selectedCharacter: [0, 'HERO'],
			activeTab: state.activeTab === 'character' ? null : state.activeTab
		}), ...actionName('deselectCharacter'))
	}
})

type SettingsPanelStore = SettingsPanelState & SettingsPanelActions

export const useSettingsPanelStore = create<SettingsPanelStore>()(
	devtools(
		(...a) => ({
			...useSettingsPanelState,
			...createSettingsPanelActions(...a)
		}),
		{ name: 'Settings Panel Store' }
	)
)
