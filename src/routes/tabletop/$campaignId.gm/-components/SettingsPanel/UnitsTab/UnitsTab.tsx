import { Stack } from '@mantine/core'
import Enemies from './Enemies'
import Heroes from './Heroes'
import InactiveHeroes from './InactiveHeroes'

export default function UnitsTab() {
	return (
		<Stack>
			<Heroes />
			<InactiveHeroes />
			<Enemies />
		</Stack>
	)
}
