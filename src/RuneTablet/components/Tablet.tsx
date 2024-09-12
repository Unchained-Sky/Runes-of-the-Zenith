import { useDndMonitor } from '@dnd-kit/core'
import { Box, Portal } from '@mantine/core'
import { type ForwardedRef, forwardRef, useRef } from 'react'
import { TABLE_SCALE, TABLET_SQUARE_SIZE } from '~/RuneTablet/data/constants'
import { useRuneTabletStore } from '~/RuneTablet/state/useRuneTabletStore'
import testForwardRef from '~/RuneTablet/utils/typeGuardForwardRef'
import { testDataIsRune, testDataIsTableSquare } from '~/RuneTablet/utils/typeGuardRuneTablet'
import { type MapKey, type MapValue } from '~/utils/mapTypes'
import { typedObject } from '~/utils/typedObject'
import DraggableRune from './DraggableRune'
import TabletSquare from './TabletSquare'

export type TabletCords = {
	x: number
	y: number
}

export type SquareRefMap = Map<`${number}-${number}`, HTMLDivElement>

export default function Tablet() {
	const tabletShape = useRuneTabletStore(state => state.tablet)

	useDropRune()
	usePickupRune()

	const squareRefs = useRef(new Map<MapKey<SquareRefMap>, MapValue<SquareRefMap>>())

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
								ref={squareRefs}
							/>
						)
					})
				})
			}

			<SlottedRunes ref={squareRefs} />
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

function usePickupRune() {
	const tabletRunes = useRuneTabletStore(state => state.runes)
	const pickupRune = useRuneTabletStore(state => state.pickupRune)
	const dropRune = useRuneTabletStore(state => state.dropRune)

	useDndMonitor({
		onDragStart: event => {
			const draggableRuneData = event.active.data.current
			if (!testDataIsRune(draggableRuneData)) return

			const { runeName } = draggableRuneData
			const runeState = tabletRunes[runeName]
			if (runeState?.state !== 'slotted') return

			pickupRune(runeName)
		},
		onDragEnd: event => {
			const draggableRuneData = event.active.data.current
			if (!testDataIsRune(draggableRuneData)) return

			const { runeName } = draggableRuneData
			if (!event.over) {
				dropRune(runeName)
			}
		}
	})
}

const SlottedRunes = forwardRef(function SlottedRunes(_props, ref: ForwardedRef<SquareRefMap>) {
	const runes = useRuneTabletStore(state => state.runes)

	if (!testForwardRef(ref)) return null

	return typedObject.entries(runes).map(([runeName, runeState]) => {
		if (runeState.state !== 'slotted' && runeState.state !== 'hovering') return null
		const squareNode = ref.current.get(`${runeState.data.x}-${runeState.data.y}`)
		return (
			<Portal key={`${runeName}-${runeState.data.x},${runeState.data.y}`} target={squareNode}>
				<DraggableRune runeName={runeName} scale={TABLE_SCALE} />
			</Portal>
		)
	})
})
