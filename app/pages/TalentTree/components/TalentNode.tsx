import { Stack, Text } from '@mantine/core'
import { type TalentNodeData } from '~/data/talents/talentData'

const size = '100px'
const nodeTypeTextColour: Record<TalentNodeData['nodeType'], string> = {
	Start: '#09ded7',
	Rune: '#4509de',
	Stat: '#deb009'
}

type TalentNodeProps = {
	nodeData: TalentNodeData
}

export default function TalentNode({ nodeData: { nodeType, nodeText, pos } }: TalentNodeProps) {
	// const [selected, setSelected] = useState(false)

	console.log({ nodeType, nodeText, pos })

	return (
		<Stack
			pos='absolute'
			left={pos.xPos}
			top={pos.yPos}
			w={size}
			h={size}
			bd='3px solid black'
			justify='center'
			gap='xs'
			style={{
				borderRadius: '20px'
			}}
		>
			<Text
				size='lg'
				c={nodeTypeTextColour[nodeType]}
				ta='center'
			>
				{nodeType}
			</Text>
			<Text
				size='sm'
				ta='center'
			>
				{nodeText}
			</Text>
		</Stack>
	)
}
