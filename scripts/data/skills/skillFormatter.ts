import { typedObject } from '~/types/typedObject'
import { type SkillNodeData } from './skillData'

type MagicNodeCategories = {
	arcane: 'astral' | 'construct' | 'sorcery'
	celestial: 'holy' | 'unholy'
	elemental: 'earth' | 'fire' | 'water' | 'wind'
	nature: 'beast_master' | 'plant' | 'shapeshift' | 'totem'
	psychic: 'inspire' | 'trickery'
	shadow: 'chaos' | 'demonology' | 'hellfire'
}

type PhysicalNodeCategories = {
	agility: 'dodge' | 'movement'
	armour: 'armour'
	bloodthirst: 'bloodthirst'
	dot: 'bleed' | 'poison'
	guardian: 'guardian'
	health: 'health'
	heavy_weaponry: 'heavy_weaponry'
	light_weaponry: 'dual_wielding' | 'small_weapon'
	ranger: 'marking' | 'ranged'
	stealth: 'stealth'
	sword_and_board: 'one_hand' | 'shield'
	unarmed: 'unarmed'
	war_cry: 'war_cry'
}

type NodeCategories = MagicNodeCategories & PhysicalNodeCategories
type NodeCategory = keyof NodeCategories

type NodeSubcategory<T extends NodeCategory> = {
	[K in T]: NodeCategories[K]
}[T]

export default function skillFormatter<T extends NodeCategory>(skillData: SkillNodeData[], category: T, subcategory: NodeSubcategory<T>) {
	return skillData.map(node => typedObject.assign(node, { skillId: `${category}-${subcategory}-${node.nodeId}` as const }))
}
