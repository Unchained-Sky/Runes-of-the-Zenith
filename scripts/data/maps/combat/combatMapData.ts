import { type CombatMap } from '~/types/gameTypes/combatMap'
import rocks from './base/rocks'
import woods from './base/woods'

export type CompendiumCombatMap = CombatMap & {
	source: string
}

const base = [
	woods,
	rocks
]

const all = [
	base.map(map => ({ ...map, source: 'Base' } satisfies CompendiumCombatMap))
].flat(1) satisfies CompendiumCombatMap[]

export default all
