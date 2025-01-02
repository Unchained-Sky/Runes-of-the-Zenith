import { type SkillNodeData } from '~/scripts/data/skills/skillData'
import skillFormatter from '~/scripts/data/skills/skillFormatter'

const chaosNodes: SkillNodeData[] = []

export default skillFormatter(chaosNodes, 'shadow', 'chaos')
