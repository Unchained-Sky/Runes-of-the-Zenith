import { useDroppable } from '@dnd-kit/core'
import { Box } from '@mantine/core'
import { useMemo } from 'react'
import { TABLE_SCALE, TABLET_SQUARE_SIZE } from '~/data/constants'
import { getRune } from '~/data/runes'
import { useRuneTabletStore } from '~/state/useRuneTabletStore'
import { type DraggableRuneData } from './DraggableRune'
import Rune from './Rune'

type TableCords = {
	left: number
	top: number
}

export default function Tablet() {
	const tabletShape = useRuneTabletStore(state => state.tablet)

	return (
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
	)
}

type TabletSquareProps = TableCords

function testDataIsRune(current: Record<string, unknown> = {}): current is DraggableRuneData {
	return Object.hasOwn(current, 'runeName')
}

function TabletSquare({ left, top }: TabletSquareProps) {
	const { isOver, active, setNodeRef } = useDroppable({
		id: `tablet-${left}-${top}`
	})

	const runeData = useMemo(() => {
		const draggableRuneData = active?.data.current
		if (!testDataIsRune(draggableRuneData)) return null
		return getRune(draggableRuneData.runeName)
	}, [active])

	return (
		<Box
			ref={setNodeRef}
			h={`${TABLET_SQUARE_SIZE}px`}
			w={`${TABLET_SQUARE_SIZE}px`}
			bd='black 1px solid'
			pos='absolute'
			left={`${TABLET_SQUARE_SIZE * left}px`}
			top={`${TABLET_SQUARE_SIZE * top}px`}
		>
			{
				isOver && runeData && (
					<Rune runeName={runeData.name} scale={TABLE_SCALE} />
				)
			}
		</Box>
	)
}
