import { Box } from '@mantine/core'
import { useRef } from 'react'
import { TABLET_SQUARE_SIZE } from '~/RT/data/constants'
import useDropRune from '~/RT/hooks/useDropRune'
import usePickupRune from '~/RT/hooks/usePickupRune'
import { useRuneTabletStore } from '~/RT/state/useRuneTabletStore'
import { type MapKey, type MapValue } from '~/utils/mapTypes'
import SlottedRunes from './SlottedRunes'
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
