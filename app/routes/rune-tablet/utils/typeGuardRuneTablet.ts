import { type DraggableRuneData } from '~/RT/components/DraggableRune'
import { type DroppableTabletSquareData } from '~/RT/components/TabletSquare'

export function testDataIsRune(current: Record<string, unknown> = {}): current is DraggableRuneData {
	return Object.hasOwn(current, 'runeName')
}

export function testDataIsTableSquare(current: Record<string, unknown> = {}): current is DroppableTabletSquareData {
	return Object.hasOwn(current, 'x') && Object.hasOwn(current, 'y')
}
