import { Stack, Title } from '@mantine/core'
import ClearEncounter from './ClearEncounter'

export default function DebugTag() {
	return (
		<Stack>
			<Title order={3}>Debug</Title>
			<ClearEncounter />
		</Stack>
	)
}
