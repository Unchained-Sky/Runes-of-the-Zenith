import { Button, Stack, Title } from '@mantine/core'
import { Form } from '@remix-run/react'

export default function LoginPage() {
	return (
		<Stack>
			<Title>Login</Title>

			<Form method='POST' action='/auth/login'>
				<input type='text' name='_intent' value='discord' hidden readOnly />
				<Button type='submit'>Login with Discord</Button>
			</Form>
		</Stack>
	)
}
