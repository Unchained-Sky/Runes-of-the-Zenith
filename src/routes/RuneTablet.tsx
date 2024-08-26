import { Stack } from '@mantine/core'
import Rune from '~/components/RuneTablet/Rune'

export default function RuneTabletPage() {
	return (
		<Stack>
			<Rune
				colour='red'
				shape={[
					['X', 'X', 'X'],
					[' ', ' ', 'X']
				]}
			/>
			<Rune
				colour='red'
				shape={[
					['X', 'X', ' '],
					[' ', 'X', 'X']
				]}
			/>
			<Rune
				colour='red'
				shape={[
					['X', 'X', 'X', 'X'],
					[' ', ' ', 'X', ' ']
				]}
			/>
			<Rune
				colour='red'
				shape={[
					['X', 'X', 'X'],
					[' ', ' ', 'X'],
					[' ', ' ', 'X'],
					[' ', ' ', 'X'],
					[' ', 'X', 'X']
				]}
			/>
		</Stack>
	)
}
