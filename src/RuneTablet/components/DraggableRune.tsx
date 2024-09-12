import { useDraggable } from '@dnd-kit/core'
import { type CSSProperties } from 'react'
import { type RuneName } from '~/data/runes'
import Rune, { type RuneProps } from '~/RT/components/Rune'
import { TABLE_SCALE } from '~/RT/data/constants'

export type DraggableRuneData = {
	runeName: RuneName
}

export default function DraggableRune({ runeName, scale = 1 }: RuneProps) {
	const { attributes, listeners, setNodeRef, transform, over } = useDraggable({
		id: `rune-${runeName}`,
		data: {
			runeName
		} satisfies DraggableRuneData
	})

	const style = (transform
		? {
			translate: `${transform.x}px ${transform.y}px 0`,
			visibility: over ? 'hidden' : undefined
		}
		: {
			cursor: 'grab',
			zIndex: '2'
		}) satisfies CSSProperties

	return (
		<Rune
			runeName={runeName}
			scale={transform ? TABLE_SCALE : scale}
			ref={setNodeRef}
			style={style}
			{...listeners}
			{...attributes}
		/>
	)
}
