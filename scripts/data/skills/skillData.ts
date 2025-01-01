import magicTalents from './magic/magicTalents'
import physicalTalents from './physical/physicalSkills'

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

// export type TalentData = TalentNodeData & {
// 	skillId: NodeName
// }

// export type NodeName<T extends NodeCategory = NodeCategory> = {
// 	[K in T]: `${K}-${NodeCategories[K]}-${number}`
// }[T]

export const skillVersion: `${number}.${number}.${number}` = '0.1.0'

export const talentData = [...physicalTalents, ...magicTalents]
