import { type Compendium } from '~/scripts/data/compendiumTypes'
import { type Enums } from '~/supabase/databaseTypes'
import { type RuneExtraData } from '~/supabase/extraDataFormatter/runeExtraData'
import { type Character } from '~/types/gameTypes/character'
import marauder from './base/marauder'
import zombeast from './base/zombeast'
import zombrero from './base/zombrero'

export type Enemy = Character & {
	stats: {
		aggression: number
	}
	runes: EnemyRuneData[]
}

type EnemyInternal = Omit<Enemy, 'runes'> & {
	runes: EnemyRuneDataInternal[]
}

type EnemyRuneDataInternal = {
	name: string
	description: string
	slot: Enums<'rune_slot'>
	effect: RuneExtraData['effect']
}

export type EnemyRuneData = {
	name: string
	slot: Enums<'rune_slot'>
	data: RuneExtraData
}

export type CompendiumEnemy = EnemyInternal & Compendium

const base = [
	marauder,
	zombeast,
	zombrero
]

const all = [
	base
].flat(1) satisfies CompendiumEnemy[]

export default all
