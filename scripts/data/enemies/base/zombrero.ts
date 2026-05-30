import { type CompendiumEnemy } from '../enemyData'

export default {
	source: 'Base',
	name: 'Zombrero',
	stats: {
		maxHealth: 350,
		shield: 10,
		int: 80,
		str: 40,
		dex: 60,
		movement: 2,
		critChance: 10,
		aggression: 6,
		intDef: 5,
		strDef: 5,
		dexDef: 5
	},
	runes: [
		{
			name: 'Attack 1',
			description: 'Attack an enemy',
			effect: [{
				range: 1,
				damage: {
					mainStats: {
						str: { flat: 5, scale: 50 }
					},
					accuracy: 75
				},
				target: { characterType: 'HERO', selectType: 'CHARACTER', amount: 1 }
			}]
		},
		{
			name: 'Attack 2',
			description: 'Attack an enemy',
			effect: [{
				range: 2,
				damage: {
					mainStats: {
						str: { flat: 5, scale: 50 }
					},
					accuracy: 75
				},
				target: { characterType: 'HERO', selectType: 'CHARACTER', amount: 3 }
			}]
		},
		{
			name: 'Attack 3',
			description: 'Attack an enemy',
			effect: [{
				range: 6,
				damage: {
					mainStats: {
						dex: { flat: 5, scale: 50 },
						str: { flat: 5, scale: 50 }
					},
					accuracy: 75
				},
				target: { characterType: 'ALL', selectType: 'TILE', amount: 2 }
			}]
		},
		{
			name: 'Attack 4',
			description: 'Attack an enemy',
			effect: [{
				range: 1,
				damage: {
					mainStats: {
						dex: { flat: 5, scale: 50 },
						str: { flat: 5, scale: 50 }
					},
					accuracy: 75
				},
				target: { characterType: 'SELF', selectType: 'CHARACTER', amount: 1 }
			}]
		}
	]
} as const satisfies CompendiumEnemy
