import { Avatar, Card, Group, Stack, Text, Title } from '@mantine/core'
import { useTabletopHeroList } from '../../../-hooks/tabletopData/useTabletopHeroList'

export default function InactiveHeroes() {
	const { data: heroList } = useTabletopHeroList()
	const inactiveHeroes = heroList.filter(hero => !hero.tabletopCharacterId)

	return inactiveHeroes.length > 0 && (
		<Stack gap={0}>
			<Title order={3}>Inactive Heroes</Title>
			<Group>
				{inactiveHeroes.map(({ heroId, heroName }) => {
					return (
						<Card key={heroId} component={Stack} gap={0} align='center' p='sm' bg='dark.5'>
							<Avatar />
							<Text>{heroName}</Text>
						</Card>
					)
				})}
			</Group>
		</Stack>
	)
}
