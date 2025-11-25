import { Avatar, Button, Group, Menu, Stack, Text, Title } from '@mantine/core'
import { type HeroDataTabletop, useTabletopHeroes } from '../../../-hooks/tabletopData/useTabletopHeroes'
import { useTabletopHeroRounds } from '../../../-hooks/tabletopData/useTabletopHeroRounds'
import { useAssignNextHeroTurn } from '../../../-utils/assignNextHeroTurn'

export default function TurnOrder() {
	const { data: heroRounds } = useTabletopHeroRounds()
	const usedTurns = heroRounds.filter(heroRound => heroRound.used)
	const unusedTurnCount = heroRounds.filter(heroRound => !heroRound.used).length

	const { data: heroesData } = useTabletopHeroes()

	return (
		<Stack align='flex-start'>
			<Title order={3}>Turn Order</Title>
			{usedTurns.map(turn => {
				const heroData = heroesData.getFromCharacterId(turn.tabletopCharacterId)
				if (!heroData) throw new Error(`Hero not found: ${turn.tabletopCharacterId}`)
				return <UsedTurn key={turn.order} turnType={turn.turnType} heroData={heroData} />
			})}

			{Array.from({ length: unusedTurnCount }).map((_, index) => {
				return <UnusedTurn key={index} />
			})}

			<AssignNextTurn />
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

function AssignNextTurn() {
	const { data: heroesData } = useTabletopHeroes()
	const allHeroes = heroesData.getAllTabletop()

	const { data: heroRounds } = useTabletopHeroRounds()

	const assignNextHeroTurn = useAssignNextHeroTurn()

	return (
		<Menu>
			<Menu.Target>
				<Button>Assign Next Turn</Button>
			</Menu.Target>

			<Menu.Dropdown>
				{allHeroes.map(heroData => {
					const rounds = heroRounds.filter(heroRound => heroRound.tabletopCharacterId === heroData.tabletopCharacter.tabletopCharacterId)
					const primary = rounds.find(round => round.turnType === 'PRIMARY')?.used
					const secondary = rounds.find(round => round.turnType === 'SECONDARY')?.used
					return (
						<Menu.Sub key={heroData.heroId}>
							<Menu.Sub.Target>
								<Menu.Sub.Item>{heroData.heroName}</Menu.Sub.Item>
							</Menu.Sub.Target>

							<Menu.Sub.Dropdown>
								<Menu.Item
									disabled={primary}
									onClick={() => {
										assignNextHeroTurn.mutate({ data: { tabletopCharacterId: heroData.tabletopCharacter.tabletopCharacterId, turnType: 'PRIMARY' } })
									}}
								>
									Primary
								</Menu.Item>
								<Menu.Item
									disabled={secondary}
									onClick={() => {
										assignNextHeroTurn.mutate({ data: { tabletopCharacterId: heroData.tabletopCharacter.tabletopCharacterId, turnType: 'SECONDARY' } })
									}}
								>
									Secondary
								</Menu.Item>
							</Menu.Sub.Dropdown>
						</Menu.Sub>
					)
				})}
			</Menu.Dropdown>
		</Menu>
	)
}
