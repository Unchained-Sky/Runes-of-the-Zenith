import { type CompendiumEnemy } from '../enemyData'

export default {
	source: 'Base',
	name: 'Marauder',
	stats: {
		maxHealth: 400,
		shield: 20,
		int: 10,
		str: 60,
		dex: 100,
		movement: 3,
		critChance: 5,
		aggression: 6,
		intDef: 5,
		strDef: 5,
		dexDef: 5
	}
} as const satisfies CompendiumEnemy
