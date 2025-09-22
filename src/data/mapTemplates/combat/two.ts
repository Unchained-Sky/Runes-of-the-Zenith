import { type CombatMapInternal } from '../combat'

export default {
	name: 'two',
	tiles: [
		{ cord: [0, -1, 1], image: 'grass', terrainType: 'NORMAL' },
		{ cord: [1, -1, 0], image: 'grass', terrainType: 'NORMAL' },

		{ cord: [-1, 0, 1], image: 'grass', terrainType: 'NORMAL' },
		{ cord: [0, 0, 0], image: 'grass', terrainType: 'NORMAL' },
		{ cord: [1, 0, -1], image: 'grass', terrainType: 'NORMAL' },

		{ cord: [-1, 1, 0], image: 'grass', terrainType: 'NORMAL' },
		{ cord: [0, 1, -1], image: 'grass', terrainType: 'NORMAL' },

		{ cord: [-2, 0, 2], image: 'rock', terrainType: 'NORMAL' },
		{ cord: [-3, 1, 2], image: 'rock', terrainType: 'NORMAL' },
		{ cord: [-3, 0, 3], image: 'rock', terrainType: 'NORMAL' },

		{ cord: [-1, 2, -1], image: 'grass', terrainType: 'NORMAL' }
	]
} as const satisfies CombatMapInternal
