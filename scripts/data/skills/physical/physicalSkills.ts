import dodge from './agility/dodge'
import movement from './agility/movement'
import armour from './armour/armour'
import bloodthirst from './bloodthirst/bloodthirst'
import bleed from './dot/bleed'
import poison from './dot/poison'
import guardian from './guardian/guardian'
import health from './health/health'
import heavyWeaponry from './heavy_weaponry/heavyWeaponry'
import dualWielding from './light_weaponry/dualWielding'
import smallWeapon from './light_weaponry/smallWeapon'
import marking from './ranger/marking'
import ranged from './ranger/ranged'
import stealth from './stealth/stealth'
import oneHand from './sword_and_board/oneHand'
import shield from './sword_and_board/shield'
import unarmed from './unarmed/unarmed'
import warCry from './war_cry/warCry'

export default [
	[
		dodge,
		movement
	],
	[
		armour
	],
	[
		bloodthirst
	],
	[
		bleed,
		poison
	],
	[
		guardian
	],
	[
		health
	],
	[
		heavyWeaponry
	],
	[
		dualWielding,
		smallWeapon
	],
	[
		marking,
		ranged
	],
	[
		stealth
	],
	[
		oneHand,
		shield
	],
	[
		unarmed
	],
	[
		warCry
	]
]
