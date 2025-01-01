import { type CombatMapInternal } from '../combat'

export default {
	name: 'one',
	tiles: [
		{ cord: [0, 0, 0], image: 'grass', terrainType: 'NORMAL' }
	]
} as const satisfies CombatMapInternal
