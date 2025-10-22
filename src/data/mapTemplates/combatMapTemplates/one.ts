import { type CombatMap } from '~/types/gameTypes/combatMap'

export default {
	name: 'one',
	tiles: [
		{ cord: [0, 0, 0], image: 'grass', terrainType: 'NORMAL' }
	]
} as const satisfies CombatMap
