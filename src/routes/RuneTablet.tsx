/* eslint-disable @typescript-eslint/restrict-template-expressions */

import { DndContext, DragOverlay, useDraggable } from '@dnd-kit/core'
import { restrictToWindowEdges } from '@dnd-kit/modifiers'
import { Group, Stack } from '@mantine/core'
import { type CSSProperties } from 'react'
import Rune, { type RuneProps } from '~/components/RuneTablet/Rune'
import Tablet from '~/components/RuneTablet/Tablet'
import { RUNE_SQUARE_SIZE } from '~/data/constants'
import runes from '~/data/runes'

export default function RuneTabletPage() {
	return (
		<DndContext modifiers={[restrictToWindowEdges]}>
			<Group h='100vh'>
				<Tablet />
				<Pouch />
			</Group>

			<DragOverlay />
		</DndContext>
	)
}

function Pouch() {
	return (
		<Stack w={`${RUNE_SQUARE_SIZE * 6}px`} align='center' justify='center'>
			{
				runes.map(rune => {
					return <DraggableRune key={rune.shape.toString()} runeData={rune} />
				})
			}
		</Stack>
	)
}

function DraggableRune({ runeData }: RuneProps) {
	const { attributes, listeners, setNodeRef, transform, over } = useDraggable({
		id: `draggable-${runeData.colour}`
	})
	const style = transform
		? {
			transform: `translate3d(${transform.x}px, ${transform.y}px, 0) scale(2)`,
			visibility: over ? 'hidden' : undefined
		} satisfies CSSProperties
		: undefined

	return <Rune runeData={runeData} ref={setNodeRef} style={style} {...listeners} {...attributes} />
}
