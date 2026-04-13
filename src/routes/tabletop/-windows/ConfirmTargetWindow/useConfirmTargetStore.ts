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
	target: RuneData['data']['target']
	selected: {
		tiles: CombatTileCordString[]
		characters: number[]
	}
} | {
	opened: false
	tabletopCharacterId: null
	tabletopCharacterType: null
	runeData: null
	target: null
	selected: null
}

const confirmTargetState = {
	opened: false,
	tabletopCharacterId: null,
	tabletopCharacterType: null,
	runeData: null,
	target: null,
	selected: null
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
			target: null,
			selected: null
		} satisfies ConfirmTargetState, ...actionName('close'))
	},
	open: ({ tabletopCharacterId, tabletopCharacterType, runeData }) => {
		set({
			opened: true,
			tabletopCharacterId,
			tabletopCharacterType,
			runeData,
			target: runeData.data.target,
			selected: {
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
				if (!state.selected || state.target.selectType !== 'TILE') return state
				return {
					selected: {
						tiles: state.selected.tiles.includes(cord)
							? state.selected.tiles.filter(t => t !== cord)
							: [...state.selected.tiles, cord],
						characters: state.selected.characters
					}
				}
			}, ...actionName('toggleTarget/cord'))
		} else if (characterId) {
			set(state => {
				if (!state.selected || state.target.selectType !== 'CHARACTER') return state
				return {
					selected: {
						tiles: state.selected.tiles,
						characters: state.selected.characters.includes(characterId)
							? state.selected.characters.filter(c => c !== characterId)
							: [...state.selected.characters, characterId]
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
