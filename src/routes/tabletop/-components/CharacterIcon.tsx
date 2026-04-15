import { useDraggable } from '@dnd-kit/react'
import { Avatar } from '@mantine/core'
import useHoldButton from '~/hooks/useHoldButton'
import { type CharacterDraggable } from '~/routes/tabletop/-components/DragDrop'
import { type Enums } from '~/supabase/databaseTypes'
import { useTabletopEnemies } from '~/tt/-hooks/tabletopData/useTabletopEnemies'
import { useTabletopHeroes } from '~/tt/-hooks/tabletopData/useTabletopHeroes'
import { useCharacterPermission } from '~/tt/-utils/characterPermission'
import { useConfirmTargetStore } from '~/tt/-windows/ConfirmTargetWindow/useConfirmTargetStore'

type CharacterIconProps = {
	tabletopCharacterId: number
	characterType: Enums<'character_type'>
}

export default function CharacterIcon({ tabletopCharacterId, characterType }: CharacterIconProps) {
	switch (characterType) {
		case 'HERO':
			return <CharacterIconHero tabletopCharacterId={tabletopCharacterId} />
		case 'ENEMY':
			return <CharacterIconEnemy tabletopCharacterId={tabletopCharacterId} />
	}
}

type CharacterIconHeroProps = {
	tabletopCharacterId: number
}

function CharacterIconHero({ tabletopCharacterId }: CharacterIconHeroProps) {
	const { data: heroesData } = useTabletopHeroes()
	const heroData = heroesData[tabletopCharacterId]
	if (!heroData) {
		console.error(`Hero not found: ${tabletopCharacterId}`)
		return null
	}

	return (
		<CharacterIconInner
			tabletopCharacterId={tabletopCharacterId}
			characterType='HERO'
			characterName={heroData.heroName}
			avatarUrl={heroData.avatarUrl}
		/>
	)
}

type CharacterIconEnemyProps = {
	tabletopCharacterId: number
}

function CharacterIconEnemy({ tabletopCharacterId }: CharacterIconEnemyProps) {
	const { data: enemiesData } = useTabletopEnemies()
	const enemyData = enemiesData[tabletopCharacterId]
	if (!enemyData) {
		console.error(`Enemy not found: ${tabletopCharacterId}`)
		return null
	}

	return (
		<CharacterIconInner
			tabletopCharacterId={tabletopCharacterId}
			characterType='ENEMY'
			characterName={enemyData.enemyName}
			avatarUrl=''
		/>
	)
}

type CharacterIconInnerProps = {
	tabletopCharacterId: number
	characterType: Enums<'character_type'>
	characterName: string
	avatarUrl: string
}

function CharacterIconInner({ tabletopCharacterId, characterType, characterName, avatarUrl }: CharacterIconInnerProps) {
	const isTargetting = useConfirmTargetStore(state => state.opened)
	const isTargettingCharacters = useConfirmTargetStore(state => state.target?.selectType === 'CHARACTER')
	const selectedCharacters = useConfirmTargetStore(state => state.selected?.characters) ?? []
	const isTargetted = selectedCharacters.includes(tabletopCharacterId)

	const hasPermission = useCharacterPermission(tabletopCharacterId)

	const { ref, isDragging } = useDraggable({
		id: `character-${tabletopCharacterId}`,
		type: 'character',
		disabled: isTargetting || !hasPermission,
		data: {
			draggableType: 'CHARACTER',
			tabletopCharacterId,
			characterType
		} satisfies CharacterDraggable
	})

	const mouseEvents = useHoldButton({
		clickCallback: () => {
			useConfirmTargetStore.getState().toggleTarget({ tabletopCharacterId })
		}
	})

	const getCursor = () => {
		if (isDragging) return 'grabbing'
		if (isTargettingCharacters) return 'pointer'
		if (isTargetting || !hasPermission) return 'default'
		return 'grab'
	}

	return (
		<Avatar
			ref={ref}
			name={characterName}
			src={avatarUrl}
			color={characterType === 'HERO' ? 'green' : 'red'}
			size='xl'
			pos='absolute'
			left='50%'
			top='50%'
			style={{
				transform: 'translate(-50%, -50%)',
				cursor: getCursor(),
				outline: isTargetted ? 'red 2px solid' : undefined,
				scale: isDragging ? '0.8' : undefined,
				transition: 'scale 150ms ease-in-out'
			}}
			{...mouseEvents}
		/>
	)
}
