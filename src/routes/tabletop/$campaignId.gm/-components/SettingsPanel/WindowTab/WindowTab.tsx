import { Chip, Group, Stack, Text, Title } from '@mantine/core'
import { useTabletopEnemies } from '~/routes/tabletop/-hooks/tabletopData/useTabletopEnemies'
import { type Enums } from '~/supabase/databaseTypes'
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

type CharacterChipProps = {
	tabletopCharacterId: number
	characterType: Enums<'character_type'>
	characterName: string
}

function CharacterChip({ tabletopCharacterId, characterType, characterName }: CharacterChipProps) {
	const windowKey = `character-${characterType}-${tabletopCharacterId}` as const

	const opened = useWindowsStore(state => state.opened[windowKey])
	const toggleWindow = useWindowsStore(state => state.toggleWindow)

	return (
		<Chip
			value={tabletopCharacterId.toString()}
			checked={opened}
			onChange={() => toggleWindow(windowKey)}
		>
			{characterName}
		</Chip>
	)
}

function HeroChips() {
	const { data: heroList } = useTabletopHeroList()

	return (
		<>
			<Text>Heroes</Text>
			<Group>
				{heroList.map(({ heroName, tabletopCharacterId }) => {
					if (!tabletopCharacterId) return null
					return (
						<CharacterChip
							key={tabletopCharacterId}
							tabletopCharacterId={tabletopCharacterId}
							characterType='HERO'
							characterName={heroName}
						/>
					)
				})}
			</Group>
		</>
	)
}

function EnemyChips() {
	const { data: enemiesData } = useTabletopEnemies()

	return (
		<>
			<Text>Enemies</Text>
			<Group>
				{Object.values(enemiesData).map(({ enemyName, tabletopCharacterId }) => {
					return (
						<CharacterChip
							key={tabletopCharacterId}
							tabletopCharacterId={tabletopCharacterId}
							characterType='ENEMY'
							characterName={enemyName}
						/>
					)
				})}
			</Group>
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
					<Chip
						value='damageSimulation'
						checked={opened.damageSimulation}
						onChange={() => toggleWindow('damageSimulation')}
					>
						Damage Simulation
					</Chip>
				</Group>
			</Chip.Group>
		</>
	)
}
