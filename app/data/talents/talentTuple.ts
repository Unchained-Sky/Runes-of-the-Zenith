import { type NodeCategories, type NodeCategory } from '~/data/categories'
import { type NodeName, type TalentNodeData } from './talentData'

export default function talentTuple<T extends NodeCategory>(talentData: TalentNodeData[], category: T, subcategory: NodeCategories[T]) {
	return talentData.map<[NodeName<T>, TalentNodeData]>(node => [`${category}-${subcategory}-${node.nodeId}`, node])
}
