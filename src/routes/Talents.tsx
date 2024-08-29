import { Box, Stack, Text } from '@mantine/core'
import { useRef } from 'react'
import { type ReactZoomPanPinchRef } from 'react-zoom-pan-pinch'
import TalentNode from '~/components/talent-tree/TalentNode'
import { talentData } from '~/data/talents/talents'

export default function TalentsPage() {
	const transformComponentRef = useRef<ReactZoomPanPinchRef>(null)

	return (
		<Stack
			h='100vh'
		>
			<Text>Talents</Text>
			{/* <TransformWrapper
				initialScale={1}
				ref={transformComponentRef}
			>
				{({ zoomIn, zoomOut, resetTransform, ...rest }) => (
					<TransformComponent> */}
			<Box
				pos='relative'
				style={{
					flex: 1
				}}
			>
				{/** Giant Talents Div **/}
				{
					[...talentData.values()].map((data, i) => {
						return (
							<TalentNode
								key={i}
								nodeData={data}
							/>
						)
					})
				}
			</Box>
			{/* </TransformComponent>
				)}
			</TransformWrapper> */}
		</Stack>
	)
}
