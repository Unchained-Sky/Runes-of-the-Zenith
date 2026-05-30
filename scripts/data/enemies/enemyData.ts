import { type Compendium } from '~/scripts/data/compendiumTypes'
import { type RuneExtraData } from '~/supabase/extraDataFormatter/runeExtraData'
import { type Character } from '~/types/gameTypes/character'
import marauder from './base/marauder'
import zombeast from './base/zombeast'
import zombrero from './base/zombrero'

export type Enemy = Character & {
	stats: {
		aggression: number
	}
	runes: EnemyRune[]
}

export type EnemyRune = {
	name: string
	description: string
	effect: RuneExtraData['effect']
}

export type CompendiumEnemy = Enemy & Compendium

const base = [
	marauder,
	zombeast,
	zombrero
]

const all = [
	base
].flat(1) satisfies CompendiumEnemy[]

export default all
