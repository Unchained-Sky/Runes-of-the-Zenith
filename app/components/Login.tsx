import { Button } from '@mantine/core'
import { Form } from '@remix-run/react'

export default function Login() {
	return (
		<Form method='POST' action='/auth/login'>
			<input type='text' name='_intent' value='discord' hidden readOnly />
			<input type='text' name='_backlink' value='/test' hidden readOnly />
			<Button type='submit'>Login with Discord</Button>
		</Form>
	)
}
