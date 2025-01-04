import { Button, rem } from '@mantine/core'
import { useSubmit } from '@remix-run/react'
import { useMapEditStore } from '../useMapEditStore'

export default function Submit() {
	const hasChanged = useMapEditStore(state => state.hasChanged)

	const submit = useSubmit()

	return Object.values(hasChanged).some(Boolean) && (
		<Button
			type='submit'
			pos='absolute'
			size='xl'
			color='green'
			right={rem(32)}
			bottom={rem(32)}
			onClick={() => {
				// TODO - only send changed data
				const { mapName, tiles } = useMapEditStore.getState()
				submit({ data: JSON.stringify({ mapName, tiles }) }, { method: 'POST', encType: 'multipart/form-data' })
			}}
		>
			Save
		</Button>
	)
}
