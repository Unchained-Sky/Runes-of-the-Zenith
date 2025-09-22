import { Button, Stack } from '@mantine/core'
import { typedObject } from '~/types/typedObject'
import { RUNE_SQUARE_SIZE } from '../data/constants'
import { useRuneTabletStore } from '../state/useRuneTabletStore'
import DraggableRune from './DraggableRune'

export default function Pouch() {
	const runes = useRuneTabletStore(state => state.runes)

	const DEV_FILL_POUCH = useRuneTabletStore(state => state.DEV_FILL_POUCH)

	return (
		<Stack w={`${RUNE_SQUARE_SIZE * 6}px`} h='100vh' py='md'>
			<Stack align='center' style={{ flex: 1 }}>
				<Button onClick={DEV_FILL_POUCH}>Fill Pouch</Button>
				{
					typedObject.entries(runes).map(([runeName, runeState]) => {
						if (runeState.state !== 'pouch') return null
						return <DraggableRune key={runeName} runeName={runeName} />
					})
				}
			</Stack>
		</Stack>
	)
}
