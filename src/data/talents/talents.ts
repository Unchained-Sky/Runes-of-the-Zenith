import { type NodeCategories, type NodeCategory } from '~/data/categories'
import magicTalentNodes from './magic/magicTalents'
import physicalTalentNodes from './physical/physicalTalents'

type NodeType =
	| 'Start'
	| 'Rune'
	| 'Stat'

type Coordinate = {
	xPos: number
	yPos: number
}

export type TalentNodeData = {
	nodeId: number
	nodeType: NodeType
	nodeText: string
	pos: Coordinate
}

type NodeName<T extends NodeCategory = NodeCategory> = {
	[K in T]: `${K}-${NodeCategories[K]}-${number}`
}[T]

export function talentTuple<T extends NodeCategory>(talentData: TalentNodeData[], category: T, subcategory: NodeCategories[T]) {
	return talentData.map<[NodeName<T>, TalentNodeData]>(node => [`${category}-${subcategory}-${node.nodeId}`, node])
}

export const talentData = new Map<NodeName, TalentNodeData>([...physicalTalentNodes, ...magicTalentNodes])
