import { Stack, Title } from '@mantine/core'
import { useTabletopEnemies } from '../../../-hooks/tabletopData/useTabletopEnemies'
import { useSettingsPanelStore } from '../useSettingsPanelStore'

export default function Enemy() {
	const [selectedCharacterId] = useSettingsPanelStore(state => state.selectedCharacter)
	const { data: enemiesData } = useTabletopEnemies()
	const enemyData = enemiesData[selectedCharacterId]
	if (!enemyData) return null

	return (
		<Stack>
			<Title order={3}>{enemyData.enemyName}</Title>
		</Stack>
	)
}
