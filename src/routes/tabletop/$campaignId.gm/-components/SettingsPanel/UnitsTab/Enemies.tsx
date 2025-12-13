import { Avatar, Card, Stack, Text, Title } from '@mantine/core'
import { useTabletopEnemies } from '../../../-hooks/tabletopData/useTabletopEnemies'

export default function Enemies() {
	const { data: enemiesData } = useTabletopEnemies()

	return (
		<Stack>
			<Title order={3}>Enemies</Title>
			{Object.entries(enemiesData).map(([key, value]) => {
				return (
					<Card key={key} component={Stack} gap={0} align='center' p='sm' bg='dark.5'>
						<Avatar />
						<Text>{value.tabletopEnemy.enemyInfo.enemyName}</Text>
					</Card>
				)
			})}
		</Stack>
	)
}
