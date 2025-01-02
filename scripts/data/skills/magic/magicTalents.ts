import astral from './arcane/astral'
import construct from './arcane/construct'
import sorcery from './arcane/sorcery'
import holy from './celestial/holy'
import unholy from './celestial/unholy'
import earth from './elemental/earth'
import fire from './elemental/fire'
import water from './elemental/water'
import wind from './elemental/wind'
import beastMaster from './nature/beastMaster'
import plant from './nature/plant'
import shapeshift from './nature/shapeshift'
import totem from './nature/totem'
import inspire from './psychic/inspire'
import trickery from './psychic/trickery'
import chaos from './shadow/chaos'
import demonology from './shadow/demonology'
import hellfire from './shadow/hellfire'

export default [
	[
		astral,
		construct,
		sorcery
	],
	[
		holy,
		unholy
	],
	[
		earth,
		fire,
		water,
		wind
	],
	[
		beastMaster,
		plant,
		shapeshift,
		totem
	],
	[
		inspire,
		trickery
	],
	[
		chaos,
		demonology,
		hellfire
	]
]
