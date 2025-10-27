import { type CompendiumEnemy } from '../enemyData'

export default {
	name: 'Zombrero',
	source: 'Base',
	stats: {
		maxHealth: 350,
		shield: 10,
		int: 80,
		str: 40,
		dex: 60,
		movement: 2,
		critChance: 10
	}
} as const satisfies CompendiumEnemy
