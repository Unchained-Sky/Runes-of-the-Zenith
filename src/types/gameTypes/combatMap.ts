import { type Tables } from '~/supabase/databaseTypes'

export type CombatTileCord = [q: number, r: number, s: number]
export type CombatTileCordString = `${number},${number},${number}`

export type CombatTile = {
	cord: CombatTileCord
	image: Tables<'map_combat_tile'>['image']
	terrainType: Tables<'map_combat_tile'>['terrain_type']
}

export type CombatMap<T extends string = string> = {
	name: T
	tiles: CombatTile[]
}
