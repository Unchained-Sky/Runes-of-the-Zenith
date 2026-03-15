import { typedSplit } from '~/types/split'
import { typedObject } from '~/types/typedObject'
import CharacterWindow from './CharacterWindow'
import RoundsWindow from './RoundsWindow'
import { useWindowsStore } from './useWindowsStore'

export default function Windows() {
	const opened = useWindowsStore(state => state.opened)
	const toggleWindow = useWindowsStore(state => state.toggleWindow)

	const characters = typedObject.keys(opened)
		.filter(key => key.startsWith('character-'))

	return (
		<>
			<RoundsWindow opened={opened.round} onClose={() => toggleWindow('round')} />

			{characters.map(character => {
				const [_, characterType, tabletopCharacterId] = typedSplit(character, '-')
				if (!characterType || !tabletopCharacterId) return

				return (
					<CharacterWindow
						key={character}
						opened={opened[character] ?? false}
						onClose={() => toggleWindow(character)}
						characterType={characterType}
						tabletopCharacterId={+tabletopCharacterId}
					/>
				)
			})}
		</>
	)
}
