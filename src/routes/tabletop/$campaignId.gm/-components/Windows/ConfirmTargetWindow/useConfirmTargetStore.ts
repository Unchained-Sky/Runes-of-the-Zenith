import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { type RuneData } from '~/scripts/data/runes/runeData'
import { type Enums } from '~/supabase/databaseTypes'
import { type CombatTileCordString } from '~/types/gameTypes/combatMap'
import { createActionName, type DevTools, type Slice } from '~/types/storeTypes'

type ConfirmTargetState = {
	opened: true
	tabletopCharacterId: number
	tabletopCharacterType: Enums<'character_type'>
	runeData: RuneData
	targeted: {
		tiles: CombatTileCordString[]
		characters: number[]
	}
} | {
	opened: false
	tabletopCharacterId: null
	tabletopCharacterType: null
	runeData: null
	targeted: null
}

const confirmTargetState = {
	opened: false,
	tabletopCharacterId: null,
	tabletopCharacterType: null,
	runeData: null,
	targeted: null
} satisfies ConfirmTargetState

type OpenActionProps = { tabletopCharacterId: number, tabletopCharacterType: Enums<'character_type'>, runeData: RuneData }

type ConfirmTargetAction = {
	close: () => void
	open: ({ tabletopCharacterId, tabletopCharacterType, runeData }: OpenActionProps) => void
	toggleTarget: (props: { cord: CombatTileCordString } | { tabletopCharacterId: number }) => void
}

const actionName = createActionName<ConfirmTargetAction>('confirmTarget')

const createConfirmWindowActions: Slice<ConfirmTargetStore, ConfirmTargetAction, [DevTools]> = (set, _get) => ({
	close: () => {
		set({
			opened: false,
			tabletopCharacterId: null,
			tabletopCharacterType: null,
			runeData: null,
			targeted: null
		} satisfies ConfirmTargetState, ...actionName('close'))
	},
	open: ({ tabletopCharacterId, tabletopCharacterType, runeData }) => {
		set({
			opened: true,
			tabletopCharacterId,
			tabletopCharacterType,
			runeData,
			targeted: {
				tiles: [],
				characters: []
			}
		} satisfies ConfirmTargetState, ...actionName('open'))
	},
	toggleTarget: props => {
		const cord = 'cord' in props ? props.cord : null
		const characterId = 'tabletopCharacterId' in props ? props.tabletopCharacterId : null

		if (cord) {
			set(state => {
				if (!state.targeted) return state
				return {
					targeted: {
						tiles: state.targeted.tiles.includes(cord)
							? state.targeted.tiles.filter(t => t !== cord)
							: [...state.targeted.tiles, cord],
						characters: state.targeted.characters
					}
				}
			}, ...actionName('toggleTarget/cord'))
		} else if (characterId) {
			set(state => {
				if (!state.targeted) return state
				return {
					targeted: {
						tiles: state.targeted.tiles,
						characters: state.targeted.characters.includes(characterId)
							? state.targeted.characters.filter(c => c !== characterId)
							: [...state.targeted.characters, characterId]
					}
				}
			}, ...actionName('toggleTarget/characterId'))
		}
	}
})

type ConfirmTargetStore = ConfirmTargetState & ConfirmTargetAction

export const useConfirmTargetStore = create<ConfirmTargetStore>()(
	devtools(
		(...a) => ({
			...confirmTargetState,
			...createConfirmWindowActions(...a)
		}),
		{ name: 'Confirm Target Store' }
	)
)
