import { type CombatMapInternal } from '../combat'

export default {
	name: 'three',
	tiles: [
		{ cord: [0, 0, 0], image: null, terrainType: 'NORMAL' },
		{ cord: [1, -1, 0], image: null, terrainType: 'NORMAL' },
		{ cord: [2, -2, 0], image: null, terrainType: 'NORMAL' },
		{ cord: [3, -3, 0], image: null, terrainType: 'NORMAL' },
		{ cord: [4, -4, 0], image: null, terrainType: 'NORMAL' }
	]
} as const satisfies CombatMapInternal
