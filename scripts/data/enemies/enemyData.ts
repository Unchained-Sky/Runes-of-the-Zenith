import { type Compendium } from '~/scripts/compendiumTypes'
import { type Enemy } from '~/types/gameTypes/enemy'
import marauder from './base/marauder'
import zombeast from './base/zombeast'
import zombrero from './base/zombrero'

export type CompendiumEnemy = Enemy & Compendium

const base = [
	marauder,
	zombeast,
	zombrero
]

const all = [
	base.map(enemy => ({ ...enemy, source: 'Base' } satisfies CompendiumEnemy))
].flat(1) satisfies CompendiumEnemy[]

export default all
