import { Stack, Title } from '@mantine/core'
import ClearEncounter from './ClearEncounter'
import ResetRounds from './ResetRounds'

export default function DebugTag() {
	return (
		<Stack>
			<Title order={3}>Debug</Title>
			<ClearEncounter />
			<ResetRounds />
		</Stack>
	)
}
