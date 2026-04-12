import { Button, Stack, Title } from '@mantine/core'
import { useStartRound } from '../../../-utils/startRound'
import { useGMTabletopRound } from '../../../../-hooks/tabletopData/useTabletopRound'

export default function NewRound() {
	const { data: roundData } = useGMTabletopRound()

	const startRound = useStartRound()

	return (
		<Stack align='flex-start'>
			<Title order={3}>Round {roundData.round}</Title>
			<Button onClick={() => startRound.mutate()} loading={startRound.isPending}>Start Next Round</Button>
		</Stack>
	)
}
