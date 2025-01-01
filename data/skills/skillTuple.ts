import { type NodeCategories, type NodeCategory } from '~/data/categories'
import { type TalentData, type TalentNodeData } from './skillData'

export default function talentTuple<T extends NodeCategory>(talentData: TalentNodeData[], category: T, subcategory: NodeCategories[T]) {
	return talentData.map<TalentData>(node => ({
		...node,
		skillId: `${category}-${subcategory}-${node.nodeId}`
	}))
}
