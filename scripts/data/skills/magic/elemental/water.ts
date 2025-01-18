import { type SkillNodeData } from '~/scripts/data/skills/skillData'
import skillFormatter from '~/scripts/data/skills/skillFormatter'

const waterNodes: SkillNodeData[] = []

export default skillFormatter(waterNodes, 'elemental', 'water')
