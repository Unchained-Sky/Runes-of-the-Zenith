import RoundsWindow from './Rounds'
import { useWindowsStore } from './useWindowsStore'

export default function Windows() {
	const opened = useWindowsStore(state => state.opened)
	const toggleWindow = useWindowsStore(state => state.toggleWindow)

	return (
		<>
			<RoundsWindow opened={opened.round} onClose={() => toggleWindow('round')} />
		</>
	)
}
