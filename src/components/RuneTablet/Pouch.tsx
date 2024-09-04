import { MultiSelect, Stack } from '@mantine/core'
import { useMemo, useState } from 'react'
import { RUNE_SQUARE_SIZE } from '~/data/constants'
import { getAllRuneNames, type RuneName } from '~/data/runes'
import DraggableRune from './DraggableRune'

export default function Pouch() {
	const allRunes = useMemo(() => getAllRuneNames(), [])

	const [activeRunes, setActiveRunes] = useState<RuneName[]>([])

	return (
		<Stack w={`${RUNE_SQUARE_SIZE * 6}px`} h='100vh' justify='space-between'>
			<MultiSelect
				searchable
				hidePickedOptions
				data={allRunes}
				value={activeRunes}
				onChange={updatedRunes => setActiveRunes(updatedRunes as RuneName[])}
				label='Rune Pouch'
				m='md'
			/>

			<Stack align='center' style={{ flex: 1 }}>
				{
					activeRunes.map(runeName => {
						return <DraggableRune key={runeName} runeName={runeName} />
					})
				}
			</Stack>
		</Stack>
	)
}
