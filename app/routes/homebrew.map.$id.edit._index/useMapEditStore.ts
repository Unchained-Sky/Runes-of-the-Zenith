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
}

type MapEditStateValues = {
	mapName: string | null
	tiles: Record<CombatTileString, CombatTile>
}

const mapEditState: MapEditState = {
	syncValue: 0,
	hasChanged: {},

	mapName: null,
	tiles: {}
}

type MapEditActions = {
	syncLoader: (loader: MapEditLoader) => void

	updateMapName: (mapName: MapEditState['mapName']) => void
}

const actionName = createActionName<MapEditActions>('mapEdit')

export const createMapEditActions: Slice<MapEditStore, MapEditActions, [DevTools]> = (set, _get) => ({
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
			mapName: null,
			tiles
		} satisfies MapEditState, ...actionName('syncLoader'))
	},

	updateMapName: mapName => {
		set({
			mapName,
			hasChanged: { mapName: !!mapName }
		}, ...actionName('updateMapName'))
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
