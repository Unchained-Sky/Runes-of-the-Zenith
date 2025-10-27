import { type CompendiumEnemy } from '../enemyData'

export default {
	name: 'Zombeast',
	source: 'Base',
	stats: {
		maxHealth: 800,
		shield: 25,
		int: 10,
		str: 150,
		dex: 40,
		movement: 2,
		critChance: 5
	}
} as const satisfies CompendiumEnemy
