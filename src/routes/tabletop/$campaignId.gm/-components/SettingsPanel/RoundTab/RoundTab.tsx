import { Stack } from '@mantine/core'
import EnemyAggression from './EnemyAggression'
import NewRound from './NextRound'
import TurnOrder from './TurnOrder'

export default function RoundTab() {
	return (
		<Stack>
			<NewRound />
			<TurnOrder />
			<EnemyAggression />
		</Stack>
	)
}
