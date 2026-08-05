import { Button, Group, Stack, Text, Title } from '@mantine/core'
import { useGMTabletopEnemies } from '~/routes/tabletop/$campaignId.gm/-hooks/tabletopData/useGMTabletopEnemies'
import { useUpdateAggression } from '~/routes/tabletop/-utils/gameActions/updateAggression'

export default function EnemyAggression() {
	const { data: enemiesData } = useGMTabletopEnemies()

	const updateAggression = useUpdateAggression()

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
							onClick={() => updateAggression.mutate({ data: {
								target: { tabletopCharacterIds: [enemyData.tabletopCharacterId] },
								amount: { relative: -1 }
							} })}
						>
							Increase
						</Button>
						<Button
							size='compact-md'
							onClick={() => updateAggression.mutate({ data: {
								target: { tabletopCharacterIds: [enemyData.tabletopCharacterId] },
								amount: { reset: true }
							} })}
						>
							Reset
						</Button>
					</Group>
				)
			})}
		</Stack>
	)
}
