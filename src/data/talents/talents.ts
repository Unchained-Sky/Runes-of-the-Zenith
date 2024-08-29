import magicTalentNodes from './magic/magicTalents'
import physicalTalentNodes from './physical/physicalTalents'

export type NodeType =
  | 'Start'
  | 'Rune'
  | 'Stat'

export type Coordinate = {
	xPos: number
	yPos: number
}

export interface TalentNodeData {
	nodeId: number
	nodeType: NodeType
	nodeText: string
	pos: Coordinate
}

type MagicNodeCategories = {
	Celestial: 'Holy' | 'Unholy'
	Elemental: 'Wind' | 'Fire' | 'Water' | 'Earth'
	Nature: 'Plant' | 'Shapeshift' | 'Totem'
	Shadow: 'Hellfire' | 'Chaos'
	Support: 'Buff' | 'Debuff' | 'Healing' | 'Summon'
	Arcane: 'Arcane'
	Psychic: 'Psychic'
}

type PhysicalNodeCategories = {
	Agility: 'Movement' | 'Dodge'
	Stealth: 'Stealth'
	Unarmed: 'Unarmed'
	Ranger: 'Ranged' | 'Marking'
	DoT: 'Bleed' | 'Poison'
	Light_Weaponry: 'Small Weapon' | 'Dual'
	Sword_and_Board: 'One Hand' | 'Shield'
	Armour: 'Armour'
	Guardian: 'Guardian'
	Health: 'Health'
	Bloodthirst: 'Bloodthirst'
	War_Cry: 'War Cry'
	Heavy_Weaponry: 'Heavy_Weaponry'
}

type NodeCategories = MagicNodeCategories & PhysicalNodeCategories

type NodeCategory = keyof MagicNodeCategories | keyof PhysicalNodeCategories

export type NodeID<T extends NodeCategory = NodeCategory> = {
	[K in T]: `${K}-${NodeCategories[K]}-${number}`
}[T]

export function talentTuple<T extends NodeCategory>(talentData: TalentNodeData[], category: T, subcategory: NodeCategories[T]) {
	return talentData.map<[NodeID<T>, TalentNodeData]>(node => [`${category}-${subcategory}-${node.nodeId}`, node])
}

export const talentData = new Map([...physicalTalentNodes, ...magicTalentNodes])
