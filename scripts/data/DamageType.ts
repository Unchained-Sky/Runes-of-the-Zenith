type DamageTypeArchetype = {
	INTELLIGENCE: {
		ARCANE: 'ASTRAL' | 'CONSTRUCTS' | 'SORCERY'
		ELEMENTAL: 'FIRE' | 'WATER' | 'WIND' | 'EARTH' | 'ELECTRIC'
	}
	DEXTERITY: {
		MONK: 'UNARMED' | 'DODGE' | 'BREWMASTER'
		ROGUE: 'STEALTH' | 'TOXINS' | 'ASSAILABLE'
	}
	STRENGTH: {
		WAR_CHIEF: 'BATTLE_CRY' | 'BLOODTHIRST'
		GUARDIAN: 'ARMOUR' | 'VIGOUR'
	}
	CHARISMA: {
		PSYCHIC: 'INSPIRE' | 'TRICKERY'
		WARLOCK: 'HELLFIRE' | 'DEMONOLOGY' | 'BLOOD_PACT'
	}
	WILLPOWER: {
		CELESTIAL: 'HOLY' | 'UNHOLY'
		NATURE: 'PLANT' | 'SHAPESHIFT' | 'THORNS'
	}
	FEROCITY: {
		WEAPONS_MASTER: 'BOW' | 'SHORT_SWORD' | 'AXE' | 'BULWARK' | 'GREAT_SWORD' | 'DAGGERS' | 'CHAINS' | 'WHIPS'
		BEAST_MASTER: 'TERRESTRIAL' | 'AERIAL' | 'AQUATIC'
	}
	OMNI: {
		DEMONIC: 'DEMONIC'
		GENERIC: 'GENERIC' | 'BASE'
	}
}

export type DamageType<T extends keyof DamageTypeArchetype = keyof DamageTypeArchetype> = keyof DamageTypeArchetype & T

export type MainDamageType = DamageType<'INTELLIGENCE' | 'DEXTERITY' | 'STRENGTH'>
export type HybridDamageType = DamageType<'CHARISMA' | 'WILLPOWER' | 'FEROCITY'>
export type TribridDamageType = DamageType<'OMNI'>

export type Archetype<T extends DamageType> = keyof DamageTypeArchetype[T]
export type Subarchetype<T extends DamageType, S extends keyof DamageTypeArchetype[T]> = {
	[K in T]: DamageTypeArchetype[T][S]
}[T]
