import { Window } from '@gfazioli/mantine-window'
import { Avatar, Group, Stack, Text, type StackProps } from '@mantine/core'
import { useTabletopHeroes } from '~/tt/-hooks/tabletopData/useTabletopHeroes'
import { useTabletopRound } from '~/tt/-hooks/tabletopData/useTabletopRound'
import { useTabletopEnemies } from '../-hooks/tabletopData/useTabletopEnemies'
import { useTabletopRounds } from '../-hooks/useTabletopRounds'
import { DEFAULT_WINDOW_PROPS, type CustomWindowProps } from './windowHelpers'

export default function RoundsWindow({ opened, onClose }: CustomWindowProps) {
	const { hero: { usedTurns, unusedTurnCount }, enemies: enemiesOrder } = useTabletopRounds()
	const { data: heroesData } = useTabletopHeroes()
	const { data: enemiesData } = useTabletopEnemies()
	const { data: roundData } = useTabletopRound()

	return (
		<Window
			{...DEFAULT_WINDOW_PROPS}
			id='round'
			opened={opened}
			onClose={onClose}
			defaultWidth={480}
			defaultHeight={165}
			minWidth={360}
			minHeight={165}
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
