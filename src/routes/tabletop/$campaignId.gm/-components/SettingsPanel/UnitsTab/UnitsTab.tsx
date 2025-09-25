import { Stack } from '@mantine/core'
import Heroes from './Heroes'
import InactiveHeroes from './InactiveHeroes'

export default function UnitsTab() {
	return (
		<Stack>
			<Heroes />
			<InactiveHeroes />
		</Stack>
	)
}
