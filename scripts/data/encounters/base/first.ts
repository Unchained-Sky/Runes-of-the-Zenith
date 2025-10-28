import { createCompendiumHash } from '~/scripts/compendiumTypes'
import marauder from '../../enemies/base/marauder'
import woods from '../../maps/combat/base/woods'
import { type CompendiumEncounter } from '../encounterData'

export default {
	source: 'Base',
	name: 'first',
	mapHash: createCompendiumHash(woods),
	tiles: [
		{
			cord: [0, -1, 1],
			enemyHash: createCompendiumHash(marauder)
		},
		{
			cord: [1, -1, 0],
			enemyHash: createCompendiumHash(marauder)
		}
	]
} as const satisfies CompendiumEncounter
