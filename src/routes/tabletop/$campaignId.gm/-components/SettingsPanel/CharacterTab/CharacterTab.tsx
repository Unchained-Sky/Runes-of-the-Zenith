import { Stack, Title } from '@mantine/core'
import { useTabletopEnemies } from '../../../-hooks/tabletopData/useTabletopEnemies'
import { useTabletopHeroes } from '../../../-hooks/tabletopData/useTabletopHeroes'
import { useSettingsPanelStore } from '../useSettingsPanelStore'

export default function CharacterTab() {
	const [_, selectedCharacterType] = useSettingsPanelStore(state => state.selectedCharacter)

	switch (selectedCharacterType) {
		case 'HERO': return <Hero />
		case 'ENEMY': return <Enemy />
	}
}

function Hero() {
	const [selectedCharacterId] = useSettingsPanelStore(state => state.selectedCharacter)
	const { data: heroesData } = useTabletopHeroes()
	const heroData = heroesData.getFromCharacterId(selectedCharacterId)
	if (!heroData) throw new Error(`Hero not found: ${selectedCharacterId}`)

	return (
		<Stack>
			<Title order={3}>{heroData.heroName}</Title>
		</Stack>
	)
}

function Enemy() {
	const [selectedCharacterId] = useSettingsPanelStore(state => state.selectedCharacter)
	const { data: enemiesData } = useTabletopEnemies()
	const enemyData = enemiesData[selectedCharacterId]
	if (!enemyData) throw new Error(`Enemy not found: ${selectedCharacterId}`)

	return (
		<Stack>
			<Title order={3}>{enemyData.tabletopEnemy.enemyInfo.enemyName}</Title>
		</Stack>
	)
}
