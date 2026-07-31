import { typedSplit } from '~/types/split'
import { typedObject } from '~/types/typedObject'
import CharacterWindow from './CharacterWindow'
import ConfirmTargetWindow from './ConfirmTargetWindow'
import DamageSimulationWindow from './DamageSimulationWindow'
import RoundsWindow from './RoundsWindow'
import { useWindowsStore } from './useWindowsStore'
import { Window } from '@gfazioli/mantine-window'

export default function Windows() {
	const opened = useWindowsStore(state => state.opened)
	const closeWindow = useWindowsStore(state => state.closeWindow)

	const characters = typedObject.keys(opened)
		.filter(key => key.startsWith('character-'))

	return (
		<Window.Group
			zIndexStrategy='normalize'
			initialZIndex={101}
			style={{
				position: 'absolute',
				inset: 0
			}}
		>
			<ConfirmTargetWindow />

			<RoundsWindow opened={opened.round} onClose={() => closeWindow('round')} />
			<DamageSimulationWindow opened={opened.damageSimulation} onClose={() => closeWindow('damageSimulation')} />

			{characters.map(character => {
				const [_, characterType, tabletopCharacterId] = typedSplit(character, '-')
				if (!characterType || !tabletopCharacterId) return

				return (
					<CharacterWindow
						key={character}
						opened={opened[character] ?? false}
						onClose={() => closeWindow(character)}
						characterType={characterType}
						tabletopCharacterId={+tabletopCharacterId}
					/>
				)
			})}
		</Window.Group>
	)
}
