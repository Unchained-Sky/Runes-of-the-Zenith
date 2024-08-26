import { Button, Stack, Title } from '@mantine/core'
import { Link } from 'react-router-dom'

export default function HomePage() {
	return (
		<Stack align='center' justify='center' h='100vh'>
			<Title>Project No Dice</Title>
			<Button component={Link} to='/talents'>Talents</Button>
			<Button component={Link} to='/rune-tablet'>Rune Tablet</Button>
		</Stack>
	)
}
