import { DndContext, DragOverlay } from '@dnd-kit/core'
import { restrictToWindowEdges } from '@dnd-kit/modifiers'
import { Group, NumberInput, Stack } from '@mantine/core'
import Pouch from 'app/routes/rune-tablet/components/Pouch'
import Tablet from 'app/routes/rune-tablet/components/Tablet'
import { useRuneTabletStore } from 'app/routes/rune-tablet/state/useRuneTabletStore'

export default function RuneTablet() {
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

			<DragOverlay style={{ cursor: 'grabbing' }} />
		</DndContext>
	)
}
