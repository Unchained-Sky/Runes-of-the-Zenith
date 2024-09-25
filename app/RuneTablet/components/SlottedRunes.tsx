import { Portal } from '@mantine/core'
import { type ForwardedRef, forwardRef } from 'react'
import { TABLE_SCALE } from '~/RT/data/constants'
import { useRuneTabletStore } from '~/RT/state/useRuneTabletStore'
import testForwardRef from '~/RT/utils/typeGuardForwardRef'
import { typedObject } from '~/utils/typedObject'
import DraggableRune from './DraggableRune'
import { type SquareRefMap } from './Tablet'

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

export default SlottedRunes
