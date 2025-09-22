import { useDndMonitor } from '@dnd-kit/core'
import { useRuneTabletStore } from '../state/useRuneTabletStore'
import { testDataIsRune, testDataIsTableSquare } from '../utils/typeGuardRuneTablet'

export default function useDropRune() {
	const placeRune = useRuneTabletStore(state => state.placeRune)
	const dropRune = useRuneTabletStore(state => state.dropRune)

	useDndMonitor({
		onDragEnd: event => {
			const draggableRuneData = event.active.data.current
			if (!testDataIsRune(draggableRuneData)) return
			const { runeName } = draggableRuneData

			if (event.over) {
				const droppableTabletSquareData = event.over.data.current
				if (!testDataIsTableSquare(droppableTabletSquareData)) return

				placeRune(runeName, droppableTabletSquareData)
			} else {
				dropRune(runeName)
			}
		}
	})
}
