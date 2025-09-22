import { Button, rem } from '@mantine/core'
import { useMapEditStore } from '../-hooks/useMapEditStore'
import { useSubmitMapChanges } from '../-hooks/useSubmitMapChanges'

export default function Submit() {
	const hasChanged = useMapEditStore(state => state.hasChanged)
	const submitting = useMapEditStore(state => state.submitting)

	const handleSubmit = useSubmitMapChanges()

	return Object.values(hasChanged).some(Boolean) && (
		<Button
			type='submit'
			pos='absolute'
			size='xl'
			color='green'
			right={rem(32)}
			bottom={rem(32)}
			loading={submitting}
			onClick={() => void handleSubmit()}
		>
			Save
		</Button>
	)
}
