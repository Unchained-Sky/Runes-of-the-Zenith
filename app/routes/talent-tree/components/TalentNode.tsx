import { Stack, Text } from '@mantine/core'
import { type SkillNodeData } from '~/scripts/data/skills/skillData'

const size = '100px'
const nodeTypeTextColour: Record<SkillNodeData['type'], string> = {
	Start: '#09ded7',
	Rune: '#4509de',
	Stat: '#deb009'
}

type TalentNodeProps = {
	nodeData: SkillNodeData
}

export default function TalentNode({ nodeData: { type, description, cord: [x, y] } }: TalentNodeProps) {
	// const [selected, setSelected] = useState(false)

	console.log({ nodeType: type, nodeText: description, cord: [x, y] })

	return (
		<Stack
			pos='absolute'
			left={x}
			top={y}
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
				c={nodeTypeTextColour[type]}
				ta='center'
			>
				{type}
			</Text>
			<Text
				size='sm'
				ta='center'
			>
				{description}
			</Text>
		</Stack>
	)
}
