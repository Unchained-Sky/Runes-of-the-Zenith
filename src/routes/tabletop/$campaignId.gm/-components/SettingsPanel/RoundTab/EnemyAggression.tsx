import { Button, Group, Stack, Text, Title } from '@mantine/core'
import { useIncreaseAggression } from '~/routes/tabletop/-utils/gameActions/increaseAggression'
import { useResetAggression } from '~/routes/tabletop/-utils/gameActions/resetAggression'
import { useGMTabletopEnemies } from '~/tt-gm/-hooks/tabletopData/useTabletopEnemies'

export default function EnemyAggression() {
	const { data: enemiesData } = useGMTabletopEnemies()

	const increaseAggression = useIncreaseAggression()

	const resetAggression = useResetAggression()

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
							onClick={() => increaseAggression.mutate({ data: { tabletopCharacterIds: [enemyData.tabletopCharacterId] } })}
						>
							Increase
						</Button>
						<Button
							size='compact-md'
							onClick={() => resetAggression.mutate({ data: { tabletopCharacterId: enemyData.tabletopCharacterId } })}
						>
							Reset
						</Button>
					</Group>
				)
			})}
		</Stack>
	)
}
