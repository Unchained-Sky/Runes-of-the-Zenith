import magicTalents from './magic/magicSkills'
import physicalTalents from './physical/physicalSkills'

/*
 * Change the version number to the current version of the skill tree
 * This will be used to delete the old skill tree data from the database
 */
export const skillVersion: `${number}.${number}.${number}` = '0.1.0'

type NodeType =
	| 'Start'
	| 'Rune'
	| 'Stat'

type Coordinate = {
	xPos: number
	yPos: number
}

export type SkillNodeData = {
	nodeId: number
	nodeType: NodeType
	nodeText: string
	pos: Coordinate
}

export const skillData = [physicalTalents, magicTalents].flat(10)
