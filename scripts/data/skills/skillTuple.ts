import { type NodeCategory, type NodeSubcategory } from './skillCategories'
import { type TalentNodeData } from './skillData'

export default function skillTuple<T extends NodeCategory>(skillData: TalentNodeData[], category: T, subcategory: NodeSubcategory<T>) {
	return skillData.map(node => ({
		...node,
		skillId: `${category}-${subcategory}-${node.nodeId}` as const
	}))
}
