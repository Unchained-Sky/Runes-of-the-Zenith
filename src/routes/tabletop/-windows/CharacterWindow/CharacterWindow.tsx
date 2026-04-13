import { Window, type WindowProps } from '@gfazioli/mantine-window'
import { type Enums } from '~/supabase/databaseTypes'
import { useGMTabletopEnemies } from '~/tt-gm/-hooks/tabletopData/useTabletopEnemies'
import { useTabletopHeroes } from '~/tt/-hooks/tabletopData/useTabletopHeroes'
import { DEFAULT_WINDOW_POSITION_X, DEFAULT_WINDOW_POSITION_Y, type WindowProps as CustomWindowProps } from '~/tt/-windows/windowHelpers'
import Enemy from './Enemy'
import { EnemyWindowContext } from './Enemy/EnemyWindowContext'
import Hero from './Hero'
import { HeroWindowContext } from './Hero/HeroWindowContext'

type CharacterWindowProps = {
	characterType: Enums<'character_type'>
	tabletopCharacterId: number
} & CustomWindowProps

const DEFAULT_WINDOW_PROPS = {
	defaultX: DEFAULT_WINDOW_POSITION_X,
	defaultY: DEFAULT_WINDOW_POSITION_Y,
	defaultWidth: 560,
	defaultHeight: 640,
	minWidth: 480,
	minHeight: 480,
	maxHeight: '100vh',
	resizable: 'both',
	fullSizeResizeHandles: true
} satisfies WindowProps

export default function CharacterWindow(props: CharacterWindowProps) {
	// TODO fix scroll not working while side draw is open
	switch (props.characterType) {
		case 'HERO': return <HeroWindow {...props} />
		case 'ENEMY': return <EnemyWindow {...props} />
	}
}

function HeroWindow({ opened, onClose, tabletopCharacterId }: CharacterWindowProps) {
	const { data: heroesData } = useTabletopHeroes()
	const heroData = heroesData[tabletopCharacterId]
	if (!heroData) throw new Error('Hero not found')

	return (
		<Window
			{...DEFAULT_WINDOW_PROPS}
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
	if (!enemyData) throw new Error('Enemy not found')

	return (
		<Window
			{...DEFAULT_WINDOW_PROPS}
			id={`character-ENEMY-${tabletopCharacterId}`}
			opened={opened}
			onClose={onClose}
			title={`Character: ${1 + 1}`}
		>
			<EnemyWindowContext value={enemyData}>
				<Enemy />
			</EnemyWindowContext>
		</Window>
	)
}
