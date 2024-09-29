import { Button } from '@mantine/core'
import { Form } from '@remix-run/react'

export default function Logout() {
	return (
		<Form method='POST' action='/auth/logout'>
			<input type='text' name='_backlink' value='/test' hidden readOnly />
			<Button type='submit'>Logout</Button>
		</Form>
	)
}
