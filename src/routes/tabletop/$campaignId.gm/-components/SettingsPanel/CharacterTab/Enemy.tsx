import { Stack, Title } from '@mantine/core'
import { useTabletopEnemies } from '../../../-hooks/tabletopData/useTabletopEnemies'
import { useSettingsPanelStore } from '../useSettingsPanelStore'
import CharacterTokens from './CharacterTokens'

export default function Enemy() {
	const [selectedCharacterId] = useSettingsPanelStore(state => state.selectedCharacter)
	const { data: enemiesData } = useTabletopEnemies()
	const enemyData = enemiesData[selectedCharacterId]
	if (!enemyData) return null

	return (
		<Stack>
			<Title order={3}>{enemyData.enemyName}</Title>

			<CharacterTokens tokens={enemyData.tokens} characterType='ENEMY' />
		</Stack>
	)
}
