import { Avatar, Card, Group, Stack, Text, Title } from '@mantine/core'
import { useTabletopHeroes } from '../../../-hooks/tabletopData/useTabletopHeroes'

export default function InactiveHeroes() {
	const { data: heroesData } = useTabletopHeroes()
	const inactiveHeroes = heroesData.getInactive()

	return inactiveHeroes.length > 0 && (
		<Stack gap={0}>
			<Title order={3}>Inactive Heroes</Title>
			<Group>
				{inactiveHeroes.map(heroId => {
					const heroData = heroesData.getFromHeroId(heroId)
					return (
						<Card key={heroId} component={Stack} gap={0} align='center' p='sm' bg='dark.5'>
							<Avatar />
							<Text>{heroData.heroName}</Text>
						</Card>
					)
				})}
			</Group>
		</Stack>
	)
}
