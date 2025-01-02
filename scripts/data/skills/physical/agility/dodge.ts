import { type SkillNodeData } from '~/scripts/data/skills/skillData'
import skillFormatter from '~/scripts/data/skills/skillFormatter'

const dodgeNodes: SkillNodeData[] = []

export default skillFormatter(dodgeNodes, 'agility', 'dodge')
