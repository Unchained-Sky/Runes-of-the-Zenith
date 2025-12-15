import { SimpleGrid, Title } from '@mantine/core'
import { useTabletopEnemies } from '../../../-hooks/tabletopData/useTabletopEnemies'
import CharacterCard from './CharacterCard'

export default function Enemies() {
	const { data: enemiesData } = useTabletopEnemies()

	return (
		<>
			<Title order={3}>Enemies</Title>
			<SimpleGrid cols={3}>
				{Object.values(enemiesData).map(enemyData => {
					return (
						<CharacterCard
							key={enemyData.tabletopCharacterId}
							character={{
								type: 'ENEMY',
								tabletopCharacterId: enemyData.tabletopCharacterId,
								characterName: enemyData.enemyName,
								stats: enemyData.stats,
								tabletopStats: enemyData.tabletopStats
							}}
						/>
					)
				})}
			</SimpleGrid>
		</>
	)
}
