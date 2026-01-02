type DamageTypeArchetype = {
	intelligence: {
		arcane: 'astral' | 'constructs' | 'sorcery'
		elemental: 'fire' | 'water' | 'wind' | 'earth' | 'electric'
	}
	dexterity: {
		monk: 'unarmed' | 'dodge' | 'brewmaster'
		rogue: 'stealth' | 'toxins' | 'assailable'
	}
	strength: {
		warChief: 'battleCry' | 'bloodthirst'
		guardian: 'armour' | 'vigour'
	}
	charisma: {
		psychic: 'inspire' | 'trickery'
		warlock: 'hellfire' | 'demonology' | 'bloodPact'
	}
	willpower: {
		celestial: 'holy' | 'unholy'
		nature: 'plant' | 'shapeshift' | 'thorns'
	}
	ferocity: {
		weaponsMaster: 'bow' | 'shortSword' | 'axe' | 'bulwark' | 'greatSword' | 'daggers' | 'chains'
	}
	omni: {
		demonic: 'demonic'
		generic: 'generic'
	}
}

export type DamageType<T extends keyof DamageTypeArchetype = keyof DamageTypeArchetype> = keyof DamageTypeArchetype & T
export type MainDamageType = DamageType<'intelligence' | 'dexterity' | 'strength'>
export type HybridDamageType = DamageType<'charisma' | 'willpower' | 'ferocity'>
export type TribridDamageType = DamageType<'omni'>

export type Archetype<T extends DamageType> = keyof DamageTypeArchetype[T]

export type Subarchetype<T extends DamageType, S extends keyof DamageTypeArchetype[T]> = {
	[K in T]: DamageTypeArchetype[T][S]
}[T]
