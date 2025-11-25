import { Stack } from '@mantine/core'
import NewRound from './NewRound'
import TurnOrder from './TurnOrder'

export default function RoundTab() {
	return (
		<Stack>
			<NewRound />
			<TurnOrder />
		</Stack>
	)
}
