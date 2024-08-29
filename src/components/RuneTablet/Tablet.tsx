import { useDroppable } from '@dnd-kit/core'
import { Box, Group } from '@mantine/core'
import { TABLET_SQUARE_SIZE } from '~/data/constants'
import { getTabletShape } from '~/data/tablet'

export default function Tablet() {
	const tabletShape = getTabletShape(38)

	return (
		<Group justify='center' style={{ flex: 1 }}>
			<Box
				h={`${tabletShape.length * TABLET_SQUARE_SIZE}px`}
				w={`${tabletShape[0].length * TABLET_SQUARE_SIZE}px`}
				pos='relative'
			>
				{
					tabletShape.map((row, rowIndex) => {
						return row.map((square, columnIndex) => {
							if (square === ' ') return null
							return (
								<TabletSquare
									key={`${rowIndex}-${columnIndex}`}
									left={columnIndex}
									top={rowIndex}
								/>
							)
						})
					})
				}
			</Box>
		</Group>
	)
}

type TabletSquareProps = {
	left: number
	top: number
}

function TabletSquare({ left, top }: TabletSquareProps) {
	const { isOver, setNodeRef } = useDroppable({
		id: `tablet-${left}-${top}`
	})

	return (
		<Box
			ref={setNodeRef}
			bg={isOver ? 'green' : 'dark'}
			h={`${TABLET_SQUARE_SIZE}px`}
			w={`${TABLET_SQUARE_SIZE}px`}
			bd='black 1px solid'
			pos='absolute'
			left={`${TABLET_SQUARE_SIZE * left}px`}
			top={`${TABLET_SQUARE_SIZE * top}px`}
		/>
	)
}
