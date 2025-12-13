import { useDraggable } from '@dnd-kit/react'
import { Avatar } from '@mantine/core'
import useHoldButton from '~/hooks/useHoldButton'
import { useTabletopEnemies } from '../-hooks/tabletopData/useTabletopEnemies'
import { useTabletopHeroes } from '../-hooks/tabletopData/useTabletopHeroes'
import { type TabletopTile } from '../-hooks/tabletopData/useTabletopTiles'
import { type CharacterDraggable } from './DragDrop'
import { useSettingsPanelStore } from './SettingsPanel/useSettingsPanelStore'

type CharacterIconProps = {
	tileData: TabletopTile
}

export default function CharacterIcon({ tileData }: CharacterIconProps) {
	const { tabletopCharacterId, characterType } = tileData

	const activeTab = useSettingsPanelStore(state => state.activeTab)
	const selectedCharacterId = useSettingsPanelStore(state => state.selectedCharacter)[0]
	const isSelected = activeTab === 'character' && selectedCharacterId === tabletopCharacterId

	const { data: heroesData } = useTabletopHeroes()
	const { data: enemiesData } = useTabletopEnemies()

	const { ref, isDragging } = useDraggable({
		id: `character-${tabletopCharacterId}`,
		type: 'character',
		disabled: !isSelected,
		data: {
			draggableType: 'CHARACTER',
			tabletopCharacterId,
			characterType
		} satisfies CharacterDraggable
	})

	const getName = () => {
		switch (characterType) {
			case 'HERO':
				return heroesData.getFromCharacterId(tabletopCharacterId)?.heroName ?? ''
			case 'ENEMY':
				return enemiesData[tabletopCharacterId]?.tabletopEnemy.enemyInfo.enemyName ?? ''
		}
	}

	const mouseEvents = useHoldButton({
		clickCallback: () => {
			if (isSelected) {
				useSettingsPanelStore.getState().deselectCharacter()
			} else {
				useSettingsPanelStore.getState().openCharacterTab(tabletopCharacterId, characterType)
			}
		}
	})

	return (
		<Avatar
			ref={ref}
			name={getName()}
			color={characterType === 'HERO' ? 'green' : 'red'}
			size='lg'
			pos='absolute'
			left='50%'
			top='50%'
			style={{
				transform: 'translate(-50%, -50%)',
				cursor: isSelected ? 'grab' : 'pointer',
				outline: isSelected ? 'red 2px solid' : undefined,
				scale: isDragging ? '0.8' : undefined,
				transition: 'scale 150ms ease-in-out'
			}}
			{...mouseEvents}
		/>
	)
}
