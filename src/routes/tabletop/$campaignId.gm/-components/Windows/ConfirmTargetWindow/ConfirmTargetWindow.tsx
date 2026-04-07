import { Window } from '@gfazioli/mantine-window'
import { Button, Group, Stack, Text } from '@mantine/core'
import { useAssignNextHeroTurn } from '../../../-utils/assignNextHeroTurn'
import { useConfirmTargetStore } from './useConfirmTargetStore'

export default function ConfirmTargetWindow() {
	const { opened, close, runeData } = useConfirmTargetStore()

	return (
		<Window
			title={`Confirm Action - ${runeData?.name}`}
			id='confirm-target'
			opened={opened}
			onClose={close}
			resizable='none'
			defaultSize={{ height: 160, width: 320 }}
		>
			<WindowInner />
		</Window>
	)
}

function WindowInner() {
	const { opened, runeData, tabletopCharacterId, tabletopCharacterType, close } = useConfirmTargetStore()

	const assignNextTurn = useAssignNextHeroTurn()

	if (!opened) return null

	const confirmTarget = () => {
		if (tabletopCharacterType === 'HERO') {
			if (runeData.slot !== 'PASSIVE') {
				assignNextTurn.mutate({
					data: {
						tabletopCharacterId,
						turnType: runeData.slot
					}
				})
			}

			// CAST RUNE
		}

		close()
	}

	return (
		<Stack>
			<Text>Target type: {runeData.data.target.selectType} {runeData.data.target.characterType} ({runeData.data.target.amount})</Text>
			<Group>
				<Button variant='default' onClick={close}>Cancel</Button>
				<Button flex={1} color='green' onClick={confirmTarget}>Confirm</Button>
			</Group>
		</Stack>
	)
}
