import { type SkillNodeData } from '~/scripts/data/skills/skillData'
import skillFormatter from '~/scripts/data/skills/skillFormatter'

const healthNodes: SkillNodeData[] = []

export default skillFormatter(healthNodes, 'health', 'health')
