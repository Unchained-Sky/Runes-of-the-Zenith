import { type SkillNodeData } from '~/scripts/data/skills/skillData'
import skillFormatter from '~/scripts/data/skills/skillFormatter'

const sorceryNodes: SkillNodeData[] = []

export default skillFormatter(sorceryNodes, 'arcane', 'sorcery')
