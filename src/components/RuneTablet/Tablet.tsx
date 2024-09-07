import { useDndMonitor, useDroppable } from '@dnd-kit/core'
import { Box } from '@mantine/core'
import { useMemo } from 'react'
import { TABLE_SCALE, TABLET_SQUARE_SIZE } from '~/data/constants'
import { getRune } from '~/data/runes'
import { useRuneTabletStore } from '~/state/useRuneTabletStore'
import DraggableRune, { type DraggableRuneData } from './DraggableRune'
import Rune from './Rune'

export type TabletCords = {
	x: number
	y: number
}

export default function Tablet() {
	const tabletShape = useRuneTabletStore(state => state.tablet)

	useDropRune()

	return (
		<Box
			h={`${tabletShape.length * TABLET_SQUARE_SIZE}px`}
			w={`${tabletShape[0].length * TABLET_SQUARE_SIZE}px`}
			pos='relative'
		>
			{
				tabletShape.map((row, rowIndex) => {
					return row.map((square, columnIndex) => {
						if (square.state === ' ') return null
						return (
							<TabletSquare
								key={`${rowIndex}-${columnIndex}`}
								x={rowIndex}
								y={columnIndex}
							/>
						)
					})
				})
			}
		</Box>
	)
}

type TabletSquareProps = TabletCords

type DroppableTabletSquareData = TabletCords

function testDataIsRune(current: Record<string, unknown> = {}): current is DraggableRuneData {
	return Object.hasOwn(current, 'runeName')
}

function testDataIsTableSquare(current: Record<string, unknown> = {}): current is DroppableTabletSquareData {
	return Object.hasOwn(current, 'x') && Object.hasOwn(current, 'y')
}

function TabletSquare({ x, y }: TabletSquareProps) {
	const runeRoot = useRuneTabletStore(state => state.tablet[x][y].runeRoot)

	const { isOver, active, setNodeRef } = useDroppable({
		id: `tablet-${x}-${y}`,
		data: {
			x,
			y
		} satisfies DroppableTabletSquareData
	})

	const heldRuneData = useMemo(() => {
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
			top={`${TABLET_SQUARE_SIZE * x}px`}
			left={`${TABLET_SQUARE_SIZE * y}px`}
		>
			{
				isOver && heldRuneData && (
					<Rune runeName={heldRuneData.name} scale={TABLE_SCALE} style={{ zIndex: '2' }} />
				)
			}
			{
				runeRoot.map(runeName => {
					return <DraggableRune key={runeName} runeName={runeName} scale={TABLE_SCALE} />
				})
			}
		</Box>
	)
}

function useDropRune() {
	const placeRune = useRuneTabletStore(state => state.placeRune)

	useDndMonitor({
		onDragEnd: event => {
			if (!event.over) return
			const draggableRuneData = event.active.data.current
			if (!testDataIsRune(draggableRuneData)) return

			const droppableTabletSquareData = event.over.data.current
			if (!testDataIsTableSquare(droppableTabletSquareData)) return

			placeRune(draggableRuneData.runeName, droppableTabletSquareData)
		}
	})
}
