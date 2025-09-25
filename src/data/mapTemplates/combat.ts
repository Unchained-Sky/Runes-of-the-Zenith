import { type Tables } from '~/supabase/databaseTypes'
import one from './combat/one'
import three from './combat/three'
import two from './combat/two'

export type CombatMap = CombatMapInternal<CombatMapTemplateName>

export type CombatMapTemplateName = typeof combatTemplateList[number]['name']

export type CombatMapInternal<T extends string = string> = {
	name: T
	tiles: CombatTile[]
}

export type CombatTile = {
	cord: CombatTileCord
	image: Tables<'map_combat_tile'>['image']
	terrainType: Tables<'map_combat_tile'>['terrain_type']
}

export type CombatTileCord = [q: number, r: number, s: number]
export type CombatTileCordString = `${number},${number},${number}`

const combatTemplateList = [
	one,
	two,
	three
] as const satisfies CombatMapInternal[]

const combatTemplates = new Map<CombatMapTemplateName, CombatMap>([
	...combatTemplateList.map<[CombatMapTemplateName, CombatMap]>(template => [template.name, template])
])

export function getCombatMapTemplate(templateName: CombatMapTemplateName) {
	if (!combatTemplates.has(templateName)) throw new Error(`Combat map template not found: ${templateName}`)
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	return combatTemplates.get(templateName) ?? combatTemplates.get('one')!
}

export function getAllCombatMapTemplates() {
	return [...combatTemplates.values()]
}
