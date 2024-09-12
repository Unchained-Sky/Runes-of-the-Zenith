import { useDndMonitor } from '@dnd-kit/core'
import { useRuneTabletStore } from '~/RT/state/useRuneTabletStore'
import { testDataIsRune } from '~/RT/utils/typeGuardRuneTablet'

export default function usePickupRune() {
	const tabletRunes = useRuneTabletStore(state => state.runes)
	const pickupRune = useRuneTabletStore(state => state.pickupRune)

	useDndMonitor({
		onDragStart: event => {
			const draggableRuneData = event.active.data.current
			if (!testDataIsRune(draggableRuneData)) return

			const { runeName } = draggableRuneData
			const runeState = tabletRunes[runeName]
			if (runeState?.state !== 'slotted') return

			pickupRune(runeName)
		}
	})
}
