import { Box } from '@mantine/core'
import { useRef } from 'react'
import { TransformComponent, TransformWrapper, type ReactZoomPanPinchRef } from 'react-zoom-pan-pinch'
import { skillData } from '~/scripts/data/skills/skillData'
import TalentNode from './TalentNode'

export default function Talents() {
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
						[...skillData.values()].map((data, i) => {
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
