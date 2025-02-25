import { Box } from '@mantine/core'
import { TABLET_SQUARE_SIZE } from 'app/routes/rune-tablet/data/constants'
import useDropRune from 'app/routes/rune-tablet/hooks/useDropRune'
import usePickupRune from 'app/routes/rune-tablet/hooks/usePickupRune'
import { useRuneTabletStore } from 'app/routes/rune-tablet/state/useRuneTabletStore'
import { useRef } from 'react'
import { type MapKey, type MapValue } from '~/types/mapTypes'
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
