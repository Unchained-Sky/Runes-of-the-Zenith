import { Stack, Title } from '@mantine/core'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
	component: App
})

function App() {
	return (
		<Stack align='center' justify='center'>
			<Title>Runes of the Zenith</Title>
		</Stack>
	)
}
