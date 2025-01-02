import { type SkillNodeData } from '~/scripts/data/skills/skillData'
import skillFormatter from '~/scripts/data/skills/skillFormatter'

const movementNodes: SkillNodeData[] = []

export default skillFormatter(movementNodes, 'agility', 'movement')
