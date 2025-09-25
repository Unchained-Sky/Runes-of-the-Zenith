import { Avatar, Card, Group, Stack, Text, Title } from '@mantine/core'
import { useTabletopHeroes } from '../../../-hooks/-useTabletopData'

export default function InactiveHeroes() {
	const { data: heroes } = useTabletopHeroes()

	const inactiveHeroes = Object.values(heroes)
		.filter(({ tabletopHero }) => tabletopHero === null)

	return inactiveHeroes.length > 0 && (
		<Stack gap={0}>
			<Title order={3}>Inactive Heroes</Title>
			<Group>
				{inactiveHeroes.map(hero => {
					return (
						<Card key={hero.heroId} component={Stack} gap={0} align='center' p='sm' bg='dark.5'>
							<Avatar />
							<Text>{hero.heroName}</Text>
						</Card>
					)
				})}
			</Group>
		</Stack>
	)
}
