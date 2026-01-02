import { type Compendium } from '~/scripts/data/compendiumTypes'
import { type CombatMap } from '~/types/gameTypes/combatMap'
import rocks from './base/rocks'
import woods from './base/woods'

export type CompendiumCombatMap = CombatMap & Compendium

const base = [
	rocks,
	woods
]

const all = [
	base
].flat(1) satisfies CompendiumCombatMap[]

export default all
