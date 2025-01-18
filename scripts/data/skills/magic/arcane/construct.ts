import { type SkillNodeData } from '~/scripts/data/skills/skillData'
import skillFormatter from '~/scripts/data/skills/skillFormatter'

const constructNodes: SkillNodeData[] = []

export default skillFormatter(constructNodes, 'arcane', 'construct')
