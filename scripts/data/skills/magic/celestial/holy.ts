import { type SkillNodeData } from '~/scripts/data/skills/skillData'
import skillFormatter from '~/scripts/data/skills/skillFormatter'

const holyNodes: SkillNodeData[] = [
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

export default skillFormatter(holyNodes, 'celestial', 'holy')
