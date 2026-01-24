import { Button, Group, Stack, Text, Title } from '@mantine/core'
import { useTabletopEnemies } from '../../../-hooks/tabletopData/useTabletopEnemies'
import { useIncreaseAggression } from '../../../-utils/increaseAggression'

export default function EnemyAggression() {
	const { data: enemiesData } = useTabletopEnemies()

	const increaseAggression = useIncreaseAggression()

	return (
		<Stack>
			<Title order={3}>Enemy Aggression</Title>
			{Object.values(enemiesData).map(enemyData => {
				return (
					<Group key={enemyData.tabletopCharacterId}>
						<Title order={4}>{enemyData.enemyName}</Title>
						<Text>Aggression: {enemyData.tabletopStats.currentAggression} / {enemyData.stats.aggression}</Text>
						<Button
							size='compact-md'
							onClick={() => increaseAggression.mutate({ data: { tabletopCharacterId: enemyData.tabletopCharacterId } })}
						>
							Increase
						</Button>
					</Group>
				)
			})}
		</Stack>
	)
}
