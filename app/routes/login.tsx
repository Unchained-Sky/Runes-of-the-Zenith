import { Button, Stack, Title } from '@mantine/core'
import { type MetaFunction } from '@remix-run/node'
import { Form } from '@remix-run/react'

export const meta: MetaFunction = () => {
	return [
		{ title: 'Login' }
	]
}

export default function Route() {
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
