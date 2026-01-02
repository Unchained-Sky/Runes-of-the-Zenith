import { createCompendiumHash } from '~/scripts/data/compendiumTypes'
import zombeast from '../../enemies/base/zombeast'
import zombrero from '../../enemies/base/zombrero'
import rocks from '../../maps/combat/base/rocks'
import { type CompendiumEncounter } from '../encounterData'

export default {
	source: 'Base',
	name: 'second',
	mapHash: createCompendiumHash(rocks),
	tiles: [
		{
			cord: [-1, 1, 0],
			enemyHash: createCompendiumHash(zombeast)
		},
		{
			cord: [0, 1, -1],
			enemyHash: createCompendiumHash(zombrero)
		}
	]
} as const satisfies CompendiumEncounter
