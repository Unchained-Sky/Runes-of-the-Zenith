import { Avatar } from '@mantine/core'
import { type Enums } from '~/supabase/databaseTypes'
import { usePlayerTabletopEnemies } from '../-hooks/tabletopData/useTabletopEnemies'
import { usePlayerTabletopHeroes } from '../../-hooks/tabletopData/useTabletopHeroes'

type CharacterIconProps = {
	tabletopCharacterId: number
	characterType: Enums<'character_type'>
}

export default function GMCharacterIcon({ tabletopCharacterId, characterType }: CharacterIconProps) {
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
	const { data: heroesData } = usePlayerTabletopHeroes()
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
	const { data: enemiesData } = usePlayerTabletopEnemies()
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
	return (
		<Avatar
			name={characterName}
			src={avatarUrl}
			color={characterType === 'HERO' ? 'green' : 'red'}
			size='xl'
			pos='absolute'
			left='50%'
			top='50%'
			style={{
				transform: 'translate(-50%, -50%)'
			}}
		/>
	)
}
