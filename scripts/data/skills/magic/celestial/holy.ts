import { type TalentNodeData } from '~/scripts/data/skills/skillData'
import skillTuple from '~/scripts/data/skills/skillTuple'

const holyTalentNodes: TalentNodeData[] = [
	{
		nodeId: 0,
		nodeType: 'Stat',
		nodeText: 'Int +1',
		pos: {
			xPos: 1000,
			yPos: 0
		}
	},
	{
		nodeId: 1,
		nodeType: 'Stat',
		nodeText: 'Int +1',
		pos: {
			xPos: 2000,
			yPos: 100
		}
	},
	{
		nodeId: 2,
		nodeType: 'Rune',
		nodeText: 'Radiant Blast',
		pos: {
			xPos: 0,
			yPos: 100
		}
	}
]

export const holySkills = skillTuple(holyTalentNodes, 'celestial', 'holy')
