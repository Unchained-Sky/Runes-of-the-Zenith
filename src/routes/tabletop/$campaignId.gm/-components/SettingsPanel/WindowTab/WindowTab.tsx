import { Button, Group, Stack, Title } from '@mantine/core'
import { typedObject } from '~/types/typedObject'
import { useWindowsStore } from '../../Windows/useWindowsStore'

export default function WindowTab() {
	const windows = useWindowsStore(state => state.opened)
	const toggleWindow = useWindowsStore(state => state.toggleWindow)

	return (
		<Stack>
			<Title order={3}>Windows</Title>

			{typedObject.entries(windows).map(([windowName, opened]) => {
				return (
					<Group key={windowName}>
						<Title order={4}>{windowName}</Title>
						<Button
							size='compact-md'
							onClick={() => toggleWindow(windowName)}
							color={opened ? 'red' : 'green'}
						>
							{opened ? 'Close' : 'Open'}
						</Button>
					</Group>
				)
			})}
		</Stack>
	)
}
