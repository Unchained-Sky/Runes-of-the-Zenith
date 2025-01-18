import { type SkillNodeData } from '~/scripts/data/skills/skillData'
import skillFormatter from '~/scripts/data/skills/skillFormatter'

const holyNodes: SkillNodeData[] = [
	{
		id: 0,
		type: 'Stat',
		description: 'Int +1',
		cord: [1000, 0],
		childNodes: [1, 2]
	},
	{
		id: 1,
		type: 'Stat',
		description: 'Int +1',
		cord: [2000, 100],
		childNodes: []
	},
	{
		id: 2,
		type: 'Rune',
		description: 'Radiant Blast',
		cord: [0, 100],
		childNodes: []
	}
]

export default skillFormatter(holyNodes, 'celestial', 'holy')
