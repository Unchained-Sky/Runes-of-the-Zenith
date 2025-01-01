type MagicNodeCategories = {
	celestial: 'holy' | 'unholy'
	elemental: 'wind' | 'fire' | 'water' | 'earth'
	nature: 'plant' | 'shapeshift' | 'totem'
	shadow: 'hellfire' | 'chaos'
	support: 'buff' | 'debuff' | 'healing' | 'summon'
	arcane: 'arcane'
	psychic: 'psychic'
}

type PhysicalNodeCategories = {
	agility: 'movement' | 'dodge'
	stealth: 'stealth'
	unarmed: 'unarmed'
	ranger: 'ranged' | 'marking'
	dot: 'bleed' | 'poison'
	light_weaponry: 'small_weapon' | 'dual'
	sword_and_board: 'one_hand' | 'shield'
	armour: 'armour'
	guardian: 'guardian'
	health: 'health'
	bloodthirst: 'bloodthirst'
	war_cry: 'war_cry'
	heavy_weaponry: 'heavy_weaponry'
}

export type NodeCategories = MagicNodeCategories & PhysicalNodeCategories
export type NodeCategory = keyof NodeCategories

export type NodeSubcategory<T extends NodeCategory> = {
	[K in T]: NodeCategories[K]
}[T]

export type CategoryKey<T extends NodeCategory = NodeCategory> = {
	[K in T]: `${K}-${NodeCategories[K]}`
}[T]
