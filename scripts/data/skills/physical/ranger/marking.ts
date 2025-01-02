import { type SkillNodeData } from '~/scripts/data/skills/skillData'
import skillFormatter from '~/scripts/data/skills/skillFormatter'

const markingNodes: SkillNodeData[] = []

export default skillFormatter(markingNodes, 'ranger', 'marking')
