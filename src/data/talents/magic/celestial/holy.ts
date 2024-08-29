import { talentTuple, type TalentNodeData } from '../../talents'

const holyTalentNodes: TalentNodeData[] = [
	{
		nodeId: 0,
		nodeType: 'Stat',
		nodeText: 'Int +1',
		pos: {
			xPos: 100,
			yPos: 100
		}
	},
	{
		nodeId: 1,
		nodeType: 'Stat',
		nodeText: 'Int +1',
		pos: {
			xPos: 250,
			yPos: 100
		}
	},
	{
		nodeId: 2,
		nodeType: 'Rune',
		nodeText: 'Radiant Blast',
		pos: {
			xPos: 400,
			yPos: 100
		}
	}
]

export default talentTuple(holyTalentNodes, 'Celestial', 'Holy')
