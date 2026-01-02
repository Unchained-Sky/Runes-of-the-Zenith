import { type Compendium, type CompendiumHash } from '~/scripts/data/compendiumTypes'
import first from './base/first'
import second from './base/second'

type EncounterTile = {
	cord: [q: number, r: number, s: number]
	enemyHash: CompendiumHash
}

export type Encounter = {
	name: string
	mapHash: CompendiumHash
	tiles: EncounterTile[]
}

export type CompendiumEncounter = Encounter & Compendium

const base = [
	first,
	second
]

const all = [
	base
].flat(1) satisfies CompendiumEncounter[]

export default all
