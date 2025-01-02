import { type SkillNodeData } from '~/scripts/data/skills/skillData'
import skillFormatter from '~/scripts/data/skills/skillFormatter'

const earthNodes: SkillNodeData[] = []

export default skillFormatter(earthNodes, 'elemental', 'earth')
