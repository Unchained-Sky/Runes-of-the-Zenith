import { Window } from '@gfazioli/mantine-window'
import { Avatar, Group, Stack, type StackProps, Text } from '@mantine/core'
import { type TabletopHeroData, useTabletopHeroes } from '../../-hooks/tabletopData/useTabletopHeroes'
import { useTabletopHeroRounds } from '../../-hooks/tabletopData/useTabletopHeroRounds'

type RoundsWindowProps = {
	opened: boolean
	onClose: () => void
}

export default function RoundsWindow({ opened, onClose }: RoundsWindowProps) {
	const { data: heroRounds } = useTabletopHeroRounds()
	const usedTurns = heroRounds.filter(heroRound => heroRound.used)
	const unusedTurnCount = heroRounds.filter(heroRound => !heroRound.used).length

	const { data: heroesData } = useTabletopHeroes()

	return (
		<Window
			id='round'
			opened={opened}
			onClose={onClose}
			defaultPosition={{ x: 316, y: 16 }}
			defaultSize={{ width: 480, height: 165 }}
			minWidth={360}
			resizable='horizontal'
			// TODO track round number
			title='Round X'
		>
			<Group gap='sm' align='flex-start' wrap='nowrap'>
				{usedTurns.map(turn => {
					const heroData = heroesData[turn.tabletopCharacterId]
					if (!heroData) throw new Error(`Hero not found: ${turn.tabletopCharacterId}`)
					return <UsedTurn key={turn.order} turnType={turn.turnType} heroData={heroData} />
				})}

				{Array.from({ length: unusedTurnCount }).map((_, index) => {
					return <UnusedTurn key={index} />
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
	turnType: 'PRIMARY' | 'SECONDARY'
	heroData: TabletopHeroData
}

function UsedTurn({ turnType, heroData }: UsedTurnProps) {
	return (
		<Stack {...TURN_STACK_PROPS}>
			<Avatar src={heroData.avatarUrl} name={heroData.heroName} color='green' />
			<Text style={{ whiteSpace: 'nowrap' }}>{heroData.heroName}</Text>
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
