import { DndContext, DragOverlay, useDraggable } from '@dnd-kit/core'
import { restrictToWindowEdges } from '@dnd-kit/modifiers'
import { Group, NumberInput, Stack } from '@mantine/core'
import { type CSSProperties } from 'react'
import Rune, { type RuneProps } from '~/components/RuneTablet/Rune'
import Tablet from '~/components/RuneTablet/Tablet'
import { RUNE_SQUARE_SIZE } from '~/data/constants'
import runes from '~/data/runes'
import { useRuneTabletStore } from '~/state/useRuneTabletStore'

export default function RuneTabletPage() {
	const setSize = useRuneTabletStore(state => state.setSize)

	return (
		<DndContext modifiers={[restrictToWindowEdges]}>
			<Group h='100vh'>
				<Stack align='center' style={{ flex: 1 }}>
					<NumberInput
						label='Rune Tablet Level'
						min={0}
						max={100}
						clampBehavior='strict'
						allowDecimal={false}
						stepHoldDelay={500}
						stepHoldInterval={t => Math.max(1000 / t ** 2, 25)}
						w='240px'
						onChange={event => setSize(+event.toString())}
					/>
					<Tablet />
				</Stack>
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
