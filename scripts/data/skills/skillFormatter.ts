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

export type NodeCategories = MagicNodeCategories & PhysicalNodeCategories
export type NodeCategory = keyof NodeCategories

type NodeSubcategory<T extends NodeCategory> = {
	[K in T]: NodeCategories[K]
}[T]

export default function skillFormatter<T extends NodeCategory>(skillData: SkillNodeData[], category: T, subcategory: NodeSubcategory<T>) {
	const idFormat = (id: number) => `${category}-${subcategory}-${id}` as const
	return skillData.map(node => {
		const nodeWithChild = typedObject.assign(node, { childNodes: node.childNodes.map(idFormat) })
		return typedObject.assign(nodeWithChild, { skillId: idFormat(node.id) })
	})
}
