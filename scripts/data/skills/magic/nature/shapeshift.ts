import { type SkillNodeData } from '~/scripts/data/skills/skillData'
import skillFormatter from '~/scripts/data/skills/skillFormatter'

const shapeshiftNodes: SkillNodeData[] = []

export default skillFormatter(shapeshiftNodes, 'nature', 'shapeshift')
