import { type SkillNodeData } from '~/scripts/data/skills/skillData'
import skillFormatter from '~/scripts/data/skills/skillFormatter'

const astralNodes: SkillNodeData[] = []

export default skillFormatter(astralNodes, 'arcane', 'astral')
