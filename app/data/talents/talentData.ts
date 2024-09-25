import { type NodeCategories, type NodeCategory } from '~/data/categories'
import magicTalents from './magic/magicTalents'
import physicalTalents from './physical/physicalTalents'

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

export type NodeName<T extends NodeCategory = NodeCategory> = {
	[K in T]: `${K}-${NodeCategories[K]}-${number}`
}[T]

export const talentData = new Map<NodeName, TalentNodeData>([...physicalTalents, ...magicTalents])
