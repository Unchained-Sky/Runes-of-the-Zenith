import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { type Tables } from '~/supabase/databaseTypes'
import { createActionName, type DevTools, type Slice } from '~/types/storeTypes'
import { type TabletopGMLoader } from '.'

type TabletopGMState = {
	syncValue: number
	/** Record<characterId, characterData> */
	characters: Record<number, TabletopGMLoader['characters'][number]>
}

const tabletopGMStore: TabletopGMState = {
	syncValue: 0,
	characters: {}
}

type TabletopCharacterData = Omit<Tables<'tabletop_characters'>, 'character_id'>

type TabletopGMActions = {
	syncLoader: (loader: TabletopGMLoader) => void

	addCharacter: (characterId: number, characterData: TabletopCharacterData) => void
	updateCharacter: (characterId: number, characterData: Partial<TabletopCharacterData>) => void
	removeCharacter: (characterId: number) => void
}

const actionName = createActionName<TabletopGMActions>('tabletopGM')

export const createTabletopGMActions: Slice<TabletopGMStore, TabletopGMActions, [DevTools]> = (set, get) => ({
	syncLoader: loader => {
		if (loader.syncValue === get().syncValue) return

		const characters = Object.fromEntries(loader.characters.map(character => [character.character_id, character]))

		set({
			syncValue: loader.syncValue,
			characters
		}, ...actionName('syncLoader'))
	},

	addCharacter: (characterId, character) => {
		set(state => ({
			characters: {
				...state.characters,
				[characterId]: {
					...state.characters[characterId],
					tabletop_characters: character
				}
			}
		}), ...actionName('addCharacter'))
	},

	updateCharacter: (characterId, characterData) => {
		const tabletopCharacterData = get().characters[characterId].tabletop_characters
		if (!tabletopCharacterData) return

		set(state => ({
			characters: {
				...state.characters,
				[characterId]: {
					...state.characters[characterId],
					tabletop_characters: {
						...tabletopCharacterData,
						...characterData
					}
				}
			}
		}), ...actionName('updateCharacter'))
	},

	removeCharacter: characterId => {
		set(state => ({
			characters: {
				...state.characters,
				[characterId]: {
					...state.characters[characterId],
					tabletop_characters: null
				}
			}
		}), ...actionName('removeCharacter'))
	}
})

type TabletopGMStore = TabletopGMState & TabletopGMActions

export const useTabletopGMStore = create<TabletopGMStore>()(
	devtools(
		(...a) => ({
			...tabletopGMStore,
			...createTabletopGMActions(...a)
		}),
		{ name: 'Tabletop GM Store' }
	)
)
