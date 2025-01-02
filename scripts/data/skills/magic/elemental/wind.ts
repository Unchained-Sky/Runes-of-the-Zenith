import { type SkillNodeData } from '~/scripts/data/skills/skillData'
import skillFormatter from '~/scripts/data/skills/skillFormatter'

const windNodes: SkillNodeData[] = []

export default skillFormatter(windNodes, 'elemental', 'wind')
