import { Box } from '@mantine/core'
import { useRef } from 'react'
import { TransformComponent, TransformWrapper, type ReactZoomPanPinchRef } from 'react-zoom-pan-pinch'
import TalentNode from '~/components/talent-tree/TalentNode'
import { talentData } from '~/data/talents/talents'

export default function TalentsPage() {
	const transformComponentRef = useRef<ReactZoomPanPinchRef>(null)

	return (
		<Box
			pos='absolute'
			style={{ inset: 0 }}
		>
			<TransformWrapper
				ref={transformComponentRef}
				minScale={0.1}
				maxScale={4}
				panning={{ velocityDisabled: true }}
				doubleClick={{ disabled: true }}
				centerOnInit={false}
				limitToBounds={false}
			>
				<TransformComponent
					wrapperStyle={{
						width: '100%',
						height: '100%'
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
				</TransformComponent>
			</TransformWrapper>
		</Box>
	)
}
