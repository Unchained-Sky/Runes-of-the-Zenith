import { Avatar, Button, Group, Stack, Text, Title } from '@mantine/core'
import { type HeroDataTabletop, useTabletopHeroes } from '../../../-hooks/tabletopData/useTabletopHeroes'
import { useTabletopHeroRounds } from '../../../-hooks/tabletopData/useTabletopHeroRounds'
import { useStartRound } from '../../../-utils/startRound'

export default function RoundTab() {
	const startRound = useStartRound()

	const { data: heroRounds } = useTabletopHeroRounds()
	const usedTurns = heroRounds.filter(heroRound => heroRound.used)
	const unusedTurnCount = heroRounds.filter(heroRound => !heroRound.used).length

	const { data: heroesData } = useTabletopHeroes()

	return (
		<Stack>
			<Stack>
				<Title order={3}>Round</Title>
				<Button onClick={() => startRound.mutate()} loading={startRound.isPending}>Start New Round</Button>
			</Stack>

			<Stack>
				<Title order={3}>Turn Order</Title>
				{usedTurns.map(turn => {
					const heroData = heroesData.getFromCharacterId(turn.tabletopCharacterId)
					if (!heroData) throw new Error(`Hero not found: ${turn.tabletopCharacterId}`)
					return <UsedTurn key={turn.order} turnType={turn.turnType} heroData={heroData} />
				})}

				{Array.from({ length: unusedTurnCount }).map((_, index) => {
					return <UnusedTurn key={index} />
				})}
			</Stack>
		</Stack>
	)
}

type UsedTurnProps = {
	turnType: 'PRIMARY' | 'SECONDARY'
	heroData: HeroDataTabletop
}

function UsedTurn({ turnType, heroData }: UsedTurnProps) {
	return (
		<Group>
			<Avatar name={heroData.heroName} color='green' />
			<Text>{heroData.heroName} [{turnType}]</Text>
		</Group>
	)
}

function UnusedTurn() {
	return (
		<Group>
			<Avatar />
			<Text>UNUSED</Text>
		</Group>
	)
}
