import { Box } from '@mantine/core'
import { useRef } from 'react'
import { TransformComponent, TransformWrapper, type ReactZoomPanPinchRef } from 'react-zoom-pan-pinch'
import TalentNode from '~/components/talent-tree/TalentNode'
import { talentData } from '~/data/talents/talents'

export default function TalentsPage() {
	const transformComponentRef = useRef<ReactZoomPanPinchRef>(null)

	const handleWheelZoom = (_: ReactZoomPanPinchRef, e: WheelEvent) => {
		e.preventDefault()
		const wrapper = transformComponentRef.current
		if (!wrapper) return

		const target = e.currentTarget as HTMLDivElement | null
		if (!target) return

		const { state } = wrapper
		const scale = state.scale
		const delta = e.deltaY < 0 ? 1.2 : 0.8

		const rect = target.getBoundingClientRect()
		const offsetX = e.clientX - rect.left
		const offsetY = e.clientY - rect.top

		const newScale = scale * delta

		const newPositionX = offsetX - (offsetX - state.positionX) * (newScale / scale)
		const newPositionY = offsetY - (offsetY - state.positionY) * (newScale / scale)

		wrapper.setTransform(newPositionX, newPositionY, newScale)
	}

	return (
		<Box
			pos='absolute'
			style={{ inset: 0 }}
		>
			<TransformWrapper
				ref={transformComponentRef}
				minScale={0.1}
				maxScale={4}
				onWheel={handleWheelZoom}
				panning={{ velocityDisabled: true }}
				doubleClick={{ disabled: true }}
				centerOnInit={false}
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
