import { type SkillNodeData } from '~/scripts/data/skills/skillData'
import skillFormatter from '~/scripts/data/skills/skillFormatter'

const unholyNodes: SkillNodeData[] = [
	{
		id: 0,
		type: 'Stat',
		description: 'Int +1',
		cord: [1000, 0],
		childNodes: [1]
	},
	{
		id: 1,
		type: 'Stat',
		description: 'Int +1',
		cord: [2000, 100],
		childNodes: [2]
	},
	{
		id: 2,
		type: 'Rune',
		description: 'Radiant Blast',
		cord: [0, 100],
		childNodes: []
	}
]

export default skillFormatter(unholyNodes, 'celestial', 'unholy')
