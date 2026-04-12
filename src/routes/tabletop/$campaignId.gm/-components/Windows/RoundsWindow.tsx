import { Window } from '@gfazioli/mantine-window'
import { Avatar, Group, Stack, type StackProps, Text } from '@mantine/core'
import { useGMTabletopEnemies } from '../../-hooks/tabletopData/useTabletopEnemies'
import { useGMTabletopHeroes } from '../../../-hooks/tabletopData/useTabletopHeroes'
import { useGMTabletopHeroRounds } from '../../../-hooks/tabletopData/useTabletopHeroRounds'
import { useGMTabletopRound } from '../../../-hooks/tabletopData/useTabletopRound'
import { DEFAULT_WINDOW_POSITION_X, DEFAULT_WINDOW_POSITION_Y, type WindowProps } from './windowHelpers'

export default function RoundsWindow({ opened, onClose }: WindowProps) {
	const { data: heroRounds } = useGMTabletopHeroRounds()
	const usedTurns = heroRounds.filter(heroRound => heroRound.used)
	const unusedTurnCount = heroRounds.filter(heroRound => !heroRound.used).length

	const { data: heroesData } = useGMTabletopHeroes()

	const { data: enemiesData } = useGMTabletopEnemies()
	const enemiesOrder = Object.values(enemiesData).reduce<Record<number, number[]>>((prev, enemyData) => {
		const aggressionLeft = Math.max(enemyData.stats.aggression - enemyData.tabletopStats.currentAggression, 0)
		return {
			...prev,
			[aggressionLeft]: prev[aggressionLeft] ? [...prev[aggressionLeft], enemyData.tabletopCharacterId] : [enemyData.tabletopCharacterId]
		}
	}, {})

	const { data: roundData } = useGMTabletopRound()

	return (
		<Window
			id='round'
			opened={opened}
			onClose={onClose}
			defaultX={DEFAULT_WINDOW_POSITION_X}
			defaultY={DEFAULT_WINDOW_POSITION_Y}
			defaultWidth={480}
			defaultHeight={165}
			minWidth={360}
			resizable='horizontal'
			title={`Round: ${roundData.round}`}
		>
			<Group gap='sm' align='flex-start' wrap='nowrap'>
				{usedTurns.map(turn => {
					const heroData = heroesData[turn.tabletopCharacterId]
					if (!heroData) throw new Error(`Hero not found: ${turn.tabletopCharacterId}`)
					return <UsedTurn key={turn.order} turnType={turn.turnType} characterData={heroData} />
				})}

				{Array.from({ length: unusedTurnCount }).map((_, index) => {
					const enemies = enemiesOrder[index]?.map(tabletopCharacterId => enemiesData[tabletopCharacterId]?.enemyName ?? 'Unknown Enemy') ?? []
					return (
						<Group key={index} gap='sm' align='flex-start' wrap='nowrap'>
							{enemies.map((enemyName, index) => {
								return (
									<UsedTurn key={index} turnType='ENEMY' characterData={{ avatarUrl: '', heroName: enemyName }} />
								)
							})}
							<UnusedTurn />
						</Group>
					)
				})}
			</Group>
		</Window>
	)
}

const TURN_STACK_PROPS: StackProps = {
	gap: 0,
	align: 'center',
	miw: 90
}

type UsedTurnProps = {
	turnType: 'PRIMARY' | 'SECONDARY' | 'ENEMY'
	characterData: {
		avatarUrl: string
		heroName: string
	}
}

function UsedTurn({ turnType, characterData }: UsedTurnProps) {
	return (
		<Stack {...TURN_STACK_PROPS}>
			<Avatar src={characterData.avatarUrl} name={characterData.heroName} color={turnType === 'ENEMY' ? 'red' : 'green'} />
			<Text style={{ whiteSpace: 'nowrap' }}>{characterData.heroName}</Text>
			<Text>{turnType}</Text>
		</Stack>
	)
}

function UnusedTurn() {
	return (
		<Stack {...TURN_STACK_PROPS}>
			<Avatar />
			<Text>UNUSED</Text>
		</Stack>
	)
}
