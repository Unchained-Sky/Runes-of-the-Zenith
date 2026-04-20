import { type } from 'arktype'

export type Character = {
	name: string
	stats: {
		maxHealth: number
		shield: number
		int: number
		str: number
		dex: number
		movement: number
		critChance: number
		intDef: number
		strDef: number
		dexDef: number
	}
}

export const characterType = type('"HERO" | "ENEMY"')
