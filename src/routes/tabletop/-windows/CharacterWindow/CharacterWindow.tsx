import { Window, type WindowProps } from '@gfazioli/mantine-window'
import { useGMTabletopEnemies } from '~/routes/tabletop/$campaignId.gm/-hooks/tabletopData/useGMTabletopEnemies'
import { type Enums } from '~/supabase/databaseTypes'
import { useTabletopHeroes } from '~/tt/-hooks/tabletopData/useTabletopHeroes'
import { DEFAULT_WINDOW_PROPS, type CustomWindowProps } from '~/tt/-windows/windowHelpers'
import Enemy from './Enemy'
import { EnemyWindowContext } from './Enemy/EnemyWindowContext'
import Hero from './Hero'
import { HeroWindowContext } from './Hero/HeroWindowContext'

type CharacterWindowProps = {
	characterType: Enums<'character_type'>
	tabletopCharacterId: number
} & CustomWindowProps

const CHARACTER_WINDOW_PROPS = {
	defaultWidth: 520,
	defaultHeight: 640,
	minWidth: 520,
	minHeight: 480,
	...DEFAULT_WINDOW_PROPS
} satisfies WindowProps

export default function CharacterWindow(props: CharacterWindowProps) {
	switch (props.characterType) {
		case 'HERO': return <HeroWindow {...props} />
		case 'ENEMY': return <EnemyWindow {...props} />
	}
}

function HeroWindow({ opened, onClose, tabletopCharacterId }: CharacterWindowProps) {
	const { data: heroesData } = useTabletopHeroes()
	const heroData = heroesData[tabletopCharacterId]
	if (!heroData) return null

	return (
		<Window
			{...CHARACTER_WINDOW_PROPS}
			id={`character-HERO-${tabletopCharacterId}`}
			opened={opened}
			onClose={onClose}
			title={heroData.heroName}
		>
			<HeroWindowContext value={heroData}>
				<Hero />
			</HeroWindowContext>
		</Window>
	)
}

function EnemyWindow({ opened, onClose, tabletopCharacterId }: CharacterWindowProps) {
	const { data: enemiesData } = useGMTabletopEnemies()
	const enemyData = enemiesData[tabletopCharacterId]
	if (!enemyData) return null

	return (
		<Window
			{...CHARACTER_WINDOW_PROPS}
			id={`character-ENEMY-${tabletopCharacterId}`}
			opened={opened}
			onClose={onClose}
			title={enemyData.enemyName}
		>
			<EnemyWindowContext value={enemyData}>
				<Enemy />
			</EnemyWindowContext>
		</Window>
	)
}
