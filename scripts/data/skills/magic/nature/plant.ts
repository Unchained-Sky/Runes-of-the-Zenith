import { type SkillNodeData } from '~/scripts/data/skills/skillData'
import skillFormatter from '~/scripts/data/skills/skillFormatter'

const plantNodes: SkillNodeData[] = []

export default skillFormatter(plantNodes, 'nature', 'plant')
