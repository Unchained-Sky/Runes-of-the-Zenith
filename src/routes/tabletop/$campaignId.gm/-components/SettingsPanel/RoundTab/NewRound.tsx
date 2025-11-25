import { Button, Stack, Title } from '@mantine/core'
import { useStartRound } from '../../../-utils/startRound'

export default function NewRound() {
	const startRound = useStartRound()

	return (
		<Stack>
			<Title order={3}>New Round</Title>
			<Button onClick={() => startRound.mutate()} loading={startRound.isPending}>Start New Round</Button>
		</Stack>
	)
}
