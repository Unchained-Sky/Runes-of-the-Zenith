import { type SkillNodeData } from '~/scripts/data/skills/skillData'
import skillFormatter from '~/scripts/data/skills/skillFormatter'

const totemNodes: SkillNodeData[] = []

export default skillFormatter(totemNodes, 'nature', 'totem')
