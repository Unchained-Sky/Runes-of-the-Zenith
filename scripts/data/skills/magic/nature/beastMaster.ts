import { type SkillNodeData } from '~/scripts/data/skills/skillData'
import skillFormatter from '~/scripts/data/skills/skillFormatter'

const beastMasterNodes: SkillNodeData[] = []

export default skillFormatter(beastMasterNodes, 'nature', 'beast_master')
