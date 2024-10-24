import { Button, Stack, Title } from '@mantine/core'
import { type MetaFunction } from '@remix-run/node'
import { Link } from '@remix-run/react'

export const meta: MetaFunction = () => {
	return [
		{ title: 'New Remix App' },
		{ name: 'description', content: 'Welcome to Remix!' }
	]
}

export default function Index() {
	return (
		<Stack align='center' justify='center' h='100vh'>
			<Title>Project No Dice</Title>
			<Button component={Link} to='/talent-tree'>Talents</Button>
			<Button component={Link} to='/rune-tablet'>Rune Tablet</Button>
		</Stack>
	)
}
