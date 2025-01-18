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

export type SkillNodeData = {
	id: number
	type: NodeType
	description: string
	cord: [x: number, y: number]
	childNodes: number[]
}

export const skillData = [physicalTalents, magicTalents].flat(10)
