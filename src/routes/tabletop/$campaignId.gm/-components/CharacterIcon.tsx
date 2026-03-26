import { useDraggable } from '@dnd-kit/react'
import { Avatar } from '@mantine/core'
import useHoldButton from '~/hooks/useHoldButton'
import { useTabletopEnemies } from '../-hooks/tabletopData/useTabletopEnemies'
import { useTabletopHeroes } from '../-hooks/tabletopData/useTabletopHeroes'
import { type TabletopTile } from '../-hooks/tabletopData/useTabletopTiles'
import { type CharacterDraggable } from './DragDrop'
import { useConfirmTargetStore } from './Windows/ConfirmTargetWindow/useConfirmTargetStore'

type CharacterIconProps = {
	tileData: TabletopTile
}

export default function CharacterIcon({ tileData: { tabletopCharacterId, characterType } }: CharacterIconProps) {
	const isTargetting = useConfirmTargetStore(state => state.opened)
	const toggleTarget = useConfirmTargetStore(state => state.toggleTarget)
	const targetCharacters = useConfirmTargetStore(state => state.targeted?.characters) ?? []
	const isTargetted = targetCharacters.includes(tabletopCharacterId)

	// TODO refactor to not load every character data on every characterIcon
	const { data: heroesData } = useTabletopHeroes()
	const { data: enemiesData } = useTabletopEnemies()

	const { ref, isDragging } = useDraggable({
		id: `character-${tabletopCharacterId}`,
		type: 'character',
		disabled: isTargetting,
		data: {
			draggableType: 'CHARACTER',
			tabletopCharacterId,
			characterType
		} satisfies CharacterDraggable
	})

	const getName = () => {
		switch (characterType) {
			case 'HERO':
				return heroesData[tabletopCharacterId]?.heroName ?? ''
			case 'ENEMY':
				return enemiesData[tabletopCharacterId]?.enemyName ?? ''
		}
	}

	const getAvatar = () => {
		switch (characterType) {
			case 'HERO':
				return heroesData[tabletopCharacterId]?.avatarUrl
			case 'ENEMY':
				return undefined
		}
	}

	const mouseEvents = useHoldButton({
		clickCallback: () => {
			toggleTarget({ tabletopCharacterId })
		}
	})

	return (
		<Avatar
			ref={ref}
			name={getName()}
			src={getAvatar()}
			color={characterType === 'HERO' ? 'green' : 'red'}
			size='xl'
			pos='absolute'
			left='50%'
			top='50%'
			style={{
				transform: 'translate(-50%, -50%)',
				cursor: isTargetting ? 'pointer' : 'grab',
				outline: isTargetted ? 'red 2px solid' : undefined,
				scale: isDragging ? '0.8' : undefined,
				transition: 'scale 150ms ease-in-out'
			}}
			{...mouseEvents}
		/>
	)
}
