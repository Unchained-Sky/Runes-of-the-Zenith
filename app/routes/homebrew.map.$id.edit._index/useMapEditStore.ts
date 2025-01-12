import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { type CombatTile, type CombatTileString } from '~/data/mapTemplates/combat'
import { createActionName, type DevTools, type Slice } from '~/types/storeTypes'
import { typedObject } from '~/types/typedObject'
import { type MapEditLoader } from './route'

type MapEditState = MapEditStateUtil & MapEditStateValues

type MapEditStateUtil = {
	syncValue: number
	hasChanged: Partial<Record<keyof MapEditStateValues, boolean>>
	selectedTiles: CombatTileString[]
}

type MapEditStateValues = {
	mapName: string | null
	tiles: Record<CombatTileString, CombatTile>
}

const mapEditState: MapEditState = {
	syncValue: 0,
	hasChanged: {},
	selectedTiles: [],

	mapName: null,
	tiles: {}
}

type MapEditActions = {
	syncLoader: (loader: MapEditLoader) => void
	selectTile: (tile: CombatTileString) => void
	clearSelectedTiles: () => void

	updateMapName: (mapName: MapEditState['mapName']) => void
	updateSelectedTiles: (tileData: Partial<CombatTile>) => void
	addTiles: (tiles: CombatTile[]) => void
	deleteSelectedTiles: () => void
}

const actionName = createActionName<MapEditActions>('mapEdit')

export const createMapEditActions: Slice<MapEditStore, MapEditActions, [DevTools]> = (set, get) => ({
	syncLoader: loader => {
		const tiles = typedObject.fromEntries(
			loader.mapTiles.map<[CombatTileString, CombatTile]>(({ q, r, s, image, terrain_type }) => [
				`${q},${r},${s}` as const,
				{
					cord: [q, r, s],
					image,
					terrainType: terrain_type
				}
			])
		)

		set({
			syncValue: loader.syncValue,
			hasChanged: {},
			selectedTiles: [],
			mapName: null,
			tiles
		} satisfies MapEditState, ...actionName('syncLoader'))
	},

	selectTile: tile => {
		set(({ selectedTiles }) => ({
			selectedTiles: selectedTiles.includes(tile)
				? selectedTiles.filter(t => t !== tile)
				: [...selectedTiles, tile]
		}), ...actionName('selectTile'))
	},

	clearSelectedTiles: () => {
		set({ selectedTiles: [] }, ...actionName('clearSelectedTiles'))
	},

	updateMapName: mapName => {
		set({
			mapName,
			hasChanged: { mapName: !!mapName }
		}, ...actionName('updateMapName'))
	},

	updateSelectedTiles: tileDate => {
		const tiles = get().selectedTiles

		set({
			hasChanged: { tiles: true }
		}, ...actionName('updateSelectedTiles/hasChanged'))

		tiles.forEach(tile => {
			set(state => ({
				tiles: {
					...state.tiles,
					[tile]: {
						...state.tiles[tile],
						...tileDate
					}
				}
			}), ...actionName(`updateSelectedTiles/updateTile/${tile}`))
		})
	},

	addTiles: tiles => {
		const newTiles = typedObject.fromEntries(
			tiles.map<[CombatTileString, CombatTile]>(({ cord, image, terrainType }) => [
				`${cord[0]},${cord[1]},${cord[2]}` as const,
				{ cord, image, terrainType }
			])
		)

		set(state => {
			return {
				hasChanged: { tiles: true },
				tiles: {
					...state.tiles,
					...newTiles
				}
			}
		}, ...actionName('addTiles'))
	},

	deleteSelectedTiles: () => {
		set({
			hasChanged: { tiles: true },
			tiles: typedObject.omit(get().tiles, get().selectedTiles),
			selectedTiles: []
		}, ...actionName('deleteSelectedTiles'))
	}
})

type MapEditStore = MapEditState & MapEditActions

export const useMapEditStore = create<MapEditStore>()(
	devtools(
		(...a) => ({
			...mapEditState,
			...createMapEditActions(...a)
		}),
		{ name: 'Map Edit Store' }
	)
)
