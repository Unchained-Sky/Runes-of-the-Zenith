import { useDroppable } from '@dnd-kit/core'
import { Box } from '@mantine/core'
import { type ForwardedRef, forwardRef, useMemo } from 'react'
import { getRune } from '~/data/runes'
import { TABLET_SQUARE_SIZE, TABLE_SCALE } from '~/RuneTablet/data/constants'
import testForwardRef from '~/RuneTablet/utils/typeGuardForwardRef'
import { testDataIsRune } from '~/RuneTablet/utils/typeGuardRuneTablet'
import Rune from './Rune'
import { type SquareRefMap, type TabletCords } from './Tablet'

type TabletSquareProps = TabletCords

export type DroppableTabletSquareData = TabletCords

const TabletSquare = forwardRef(function TabletSquare({ x, y }: TabletSquareProps, ref: ForwardedRef<SquareRefMap>) {
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
			id={`runeSquare-${x},${y}`}
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
			<Box
				ref={node => {
					if (!testForwardRef(ref)) return
					const map = ref.current
					if (node) {
						map.set(`${x}-${y}`, node)
					} else {
						map.delete(`${x}-${y}`)
					}
				}}
			/>
		</Box>
	)
})

export default TabletSquare
