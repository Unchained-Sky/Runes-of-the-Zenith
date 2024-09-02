import { useDraggable } from '@dnd-kit/core'
import { MultiSelect, Stack } from '@mantine/core'
import { useMemo, useState, type CSSProperties } from 'react'
import { RUNE_SQUARE_SIZE } from '~/data/constants'
import { getAllRuneNames, type RuneName } from '~/data/runes'
import Rune, { type RuneProps } from './Rune'

export default function Pouch() {
	const allRunes = useMemo(() => getAllRuneNames(), [])

	const [activeRunes, setActiveRunes] = useState<RuneName[]>([])

	return (
		<Stack w={`${RUNE_SQUARE_SIZE * 6}px`} h='100vh' justify='space-between'>
			<MultiSelect
				searchable
				hidePickedOptions
				data={allRunes}
				value={activeRunes}
				onChange={updatedRunes => setActiveRunes(updatedRunes as RuneName[])}
				label='Rune Pouch'
				m='md'
			/>

			<Stack align='center' style={{ flex: 1 }}>
				{
					activeRunes.map(runeName => {
						return <DraggableRune key={runeName} runeName={runeName} />
					})
				}
			</Stack>
		</Stack>
	)
}

function DraggableRune({ runeName }: RuneProps) {
	const { attributes, listeners, setNodeRef, transform, over } = useDraggable({
		id: `draggable-${runeName}`
	})

	const style = transform
		? {
			transform: `translate3d(${transform.x}px, ${transform.y}px, 0) scale(2)`,
			visibility: over ? 'hidden' : undefined
		} satisfies CSSProperties
		: undefined

	return <Rune runeName={runeName} ref={setNodeRef} style={style} {...listeners} {...attributes} />
}
