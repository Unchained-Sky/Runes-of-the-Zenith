import { Stack } from '@mantine/core'
import Characters from './Characters'
import InactiveCharacters from './InactiveCharacters'

export default function UnitsTab() {
	return (
		<Stack>
			<Characters />
			<InactiveCharacters />
		</Stack>
	)
}
