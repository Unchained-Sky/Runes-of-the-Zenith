import { type SkillNodeData } from '~/scripts/data/skills/skillData'
import skillFormatter from '~/scripts/data/skills/skillFormatter'

const guardianNodes: SkillNodeData[] = []

export default skillFormatter(guardianNodes, 'guardian', 'guardian')
