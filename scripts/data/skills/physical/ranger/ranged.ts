import { type SkillNodeData } from '~/scripts/data/skills/skillData'
import skillFormatter from '~/scripts/data/skills/skillFormatter'

const rangedNodes: SkillNodeData[] = []

export default skillFormatter(rangedNodes, 'ranger', 'ranged')
