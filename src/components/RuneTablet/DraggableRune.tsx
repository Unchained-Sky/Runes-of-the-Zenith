import { useDraggable } from '@dnd-kit/core'
import { type CSSProperties } from 'react'
import { TABLE_SCALE } from '~/data/constants'
import { type RuneName } from '~/data/runes'
import Rune, { type RuneProps } from './Rune'

export type DraggableRuneData = {
	runeName: RuneName
}

export default function DraggableRune({ runeName }: RuneProps) {
	const { attributes, listeners, setNodeRef, transform, over } = useDraggable({
		id: `rune-${runeName}`,
		data: {
			runeName
		} satisfies DraggableRuneData
	})

	const style = transform
		? {
			translate: `${transform.x}px ${transform.y}px 0`,
			scale: TABLE_SCALE.toString(),
			visibility: over ? 'hidden' : undefined
		} satisfies CSSProperties
		: undefined

	return <Rune runeName={runeName} ref={setNodeRef} style={style} {...listeners} {...attributes} />
}
