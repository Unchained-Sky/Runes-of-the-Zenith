import { type SkillNodeData } from '~/scripts/data/skills/skillData'
import skillFormatter from '~/scripts/data/skills/skillFormatter'

const poisonNodes: SkillNodeData[] = []

export default skillFormatter(poisonNodes, 'dot', 'poison')
