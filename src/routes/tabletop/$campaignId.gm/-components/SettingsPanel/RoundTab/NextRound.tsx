import { Button, Stack, Title } from '@mantine/core'
import { useTabletopRound } from '../../../-hooks/tabletopData/useTabletopRound'
import { useStartRound } from '../../../-utils/startRound'

export default function NewRound() {
	const { data: roundData } = useTabletopRound()

	const startRound = useStartRound()

	return (
		<Stack align='flex-start'>
			<Title order={3}>Round {roundData.round}</Title>
			<Button onClick={() => startRound.mutate()} loading={startRound.isPending}>Start Next Round</Button>
		</Stack>
	)
}
