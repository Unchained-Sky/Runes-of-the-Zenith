import { type SkillNodeData } from '~/scripts/data/skills/skillData'
import skillFormatter from '~/scripts/data/skills/skillFormatter'

const fireNodes: SkillNodeData[] = []

export default skillFormatter(fireNodes, 'elemental', 'fire')
