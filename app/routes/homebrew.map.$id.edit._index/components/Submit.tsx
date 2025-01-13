import { Button, rem } from '@mantine/core'
import { useSubmit } from '@remix-run/react'
import { typedObject } from '~/types/typedObject'
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
				const changedKeys = typedObject.entries(hasChanged)
					.filter(([_key, value]) => value)
					.map(([key, _value]) => key)
				const data = typedObject.pick(useMapEditStore.getState(), changedKeys)
				submit({ data: JSON.stringify(data) }, { method: 'POST', encType: 'multipart/form-data' })
			}}
		>
			Save
		</Button>
	)
}
