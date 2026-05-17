import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { type RuneData, type RuneEffectData } from '~/scripts/data/runes/runeData'
import { type Enums } from '~/supabase/databaseTypes'
import { type CombatTileCordString } from '~/types/gameTypes/combatMap'
import { createActionName, type DevTools, type Slice } from '~/types/storeTypes'

type ConfirmTargetState = {
	opened: true
	tabletopCharacterId: number
	tabletopCharacterType: Enums<'character_type'>
	runeData: RuneData
	target: RuneEffectData['target'][]
	currentEffectIndex: number
	selected: ({
		tiles: CombatTileCordString[]
	} | {
		characters: { tabletopCharacterId: number, characterType: Enums<'character_type'> }[]
	})[]
} | {
	opened: false
	tabletopCharacterId: null
	tabletopCharacterType: null
	runeData: null
	target: null
	currentEffectIndex: null
	selected: null
}

const confirmTargetState = {
	opened: false,
	tabletopCharacterId: null,
	tabletopCharacterType: null,
	runeData: null,
	target: null,
	currentEffectIndex: null,
	selected: null
} satisfies ConfirmTargetState

type OpenActionProps = { tabletopCharacterId: number, tabletopCharacterType: Enums<'character_type'>, runeData: RuneData }

type ConfirmTargetAction = {
	close: () => void
	open: ({ tabletopCharacterId, tabletopCharacterType, runeData }: OpenActionProps) => void
	toggleTarget: (props: { cord: CombatTileCordString } | { tabletopCharacterId: number, characterType: Enums<'character_type'> }) => void
	changeStep: (step: number) => void
	nextStep: () => void
	backStep: () => void
}

const actionName = createActionName<ConfirmTargetAction>('confirmTarget')

const createConfirmWindowActions: Slice<ConfirmTargetStore, ConfirmTargetAction, [DevTools]> = (set, get) => ({
	close: () => {
		set({
			opened: false,
			tabletopCharacterId: null,
			tabletopCharacterType: null,
			runeData: null,
			target: null,
			currentEffectIndex: null,
			selected: null
		} satisfies ConfirmTargetState, ...actionName('close'))
	},
	open: ({ tabletopCharacterId, tabletopCharacterType, runeData }) => {
		set({
			opened: true,
			tabletopCharacterId,
			tabletopCharacterType,
			runeData,
			target: runeData.data.effect.map(effect => effect.target),
			currentEffectIndex: 0,
			selected: []
		} satisfies ConfirmTargetState, ...actionName('open'))
	},
	toggleTarget: props => {
		const cord = 'cord' in props ? props.cord : null
		const characterId = 'tabletopCharacterId' in props ? props.tabletopCharacterId : null
		const characterType = 'characterType' in props ? props.characterType : null

		const { target, currentEffectIndex } = get()
		if (!target) return

		const currentEffect = target[currentEffectIndex]
		if (!currentEffect) return

		if (cord) {
			set(state => {
				if (!state.selected || currentEffect.selectType !== 'TILE') return state
				const currentSelected = state.selected[currentEffectIndex] ?? {
					tiles: []
				}
				if (!('tiles' in currentSelected)) return state
				const newSelected = state.selected
				newSelected[currentEffectIndex] = {
					tiles: currentSelected.tiles.includes(cord)
						? currentSelected.tiles.filter(t => t !== cord)
						: [...currentSelected.tiles, cord]
				}
				return { selected: newSelected }
			}, ...actionName('toggleTarget/cord'))
		} else if (characterId && characterType) {
			set(state => {
				if (!state.selected || currentEffect.selectType !== 'CHARACTER') return state
				const currentSelected = state.selected[currentEffectIndex] ?? {
					characters: []
				}
				if (!('characters' in currentSelected)) return state
				const newSelected = state.selected
				newSelected[currentEffectIndex] = {
					characters: currentSelected.characters.filter(character => character.tabletopCharacterId === characterId).length
						? currentSelected.characters.filter(character => character.tabletopCharacterId !== characterId)
						: [...currentSelected.characters, { tabletopCharacterId: characterId, characterType }]
				}
				return { selected: newSelected }
			}, ...actionName('toggleTarget/characterId'))
		}
	},
	changeStep: step => {
		const { target } = get()
		if (!target || step < 0 || step > target.length - 1) return
		set({ currentEffectIndex: step }, ...actionName('changeStep'))
	},
	nextStep: () => {
		const { currentEffectIndex } = get()
		if (currentEffectIndex === null) return
		get().changeStep(currentEffectIndex + 1)
	},
	backStep: () => {
		const { currentEffectIndex } = get()
		if (currentEffectIndex === null) return
		get().changeStep(currentEffectIndex - 1)
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
