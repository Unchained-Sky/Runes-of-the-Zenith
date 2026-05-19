import { Chip, Group, Stack, Text, Title } from '@mantine/core'
import { useTabletopEnemies } from '~/routes/tabletop/-hooks/tabletopData/useTabletopEnemies'
import { useTabletopHeroList } from '~/tt/-hooks/tabletopData/useTabletopHeroList'
import { useWindowsStore } from '~/tt/-windows/useWindowsStore'

export default function WindowTab() {
	return (
		<Stack>
			<Title order={3}>Windows</Title>
			<HeroChips />
			<EnemyChips />
			<GameChips />
		</Stack>
	)
}

function HeroChips() {
	const { data: heroList } = useTabletopHeroList()

	const opened = useWindowsStore(state => state.opened)
	const toggleWindow = useWindowsStore(state => state.toggleWindow)

	return (
		<>
			<Text>Heroes</Text>
			<Chip.Group multiple>
				<Group>
					{heroList.map(({ heroName, tabletopCharacterId }) => {
						if (!tabletopCharacterId) return null
						return (
							<Chip
								key={tabletopCharacterId}
								value={tabletopCharacterId.toString()}
								checked={opened[`character-HERO-${tabletopCharacterId}`]}
								onChange={() => toggleWindow(`character-HERO-${tabletopCharacterId}`)}
							>
								{heroName}
							</Chip>
						)
					})}
				</Group>
			</Chip.Group>
		</>
	)
}

function EnemyChips() {
	const { data: enemiesData } = useTabletopEnemies()

	const opened = useWindowsStore(state => state.opened)
	const toggleWindow = useWindowsStore(state => state.toggleWindow)

	return (
		<>
			<Text>Enemies</Text>
			<Chip.Group multiple>
				<Group>
					{Object.values(enemiesData).map(({ enemyName, tabletopCharacterId }) => {
						return (
							<Chip
								key={tabletopCharacterId}
								value={tabletopCharacterId.toString()}
								checked={opened[`character-ENEMY-${tabletopCharacterId}`]}
								onChange={() => toggleWindow(`character-ENEMY-${tabletopCharacterId}`)}
							>
								{enemyName}
							</Chip>
						)
					})}
				</Group>
			</Chip.Group>
		</>
	)
}

function GameChips() {
	const opened = useWindowsStore(state => state.opened)
	const toggleWindow = useWindowsStore(state => state.toggleWindow)

	return (
		<>
			<Text>Game</Text>
			<Chip.Group multiple>
				<Group>
					<Chip
						value='rounds'
						checked={opened.round}
						onChange={() => toggleWindow('round')}
					>
						Rounds
					</Chip>
				</Group>
			</Chip.Group>
		</>
	)
}
