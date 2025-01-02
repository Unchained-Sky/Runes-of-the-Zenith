import { type SkillNodeData } from '~/scripts/data/skills/skillData'
import skillFormatter from '~/scripts/data/skills/skillFormatter'

const shieldNodes: SkillNodeData[] = []

export default skillFormatter(shieldNodes, 'sword_and_board', 'shield')
