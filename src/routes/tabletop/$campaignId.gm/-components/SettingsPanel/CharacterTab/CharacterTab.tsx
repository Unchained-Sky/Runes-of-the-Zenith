import { useSettingsPanelStore } from '../useSettingsPanelStore'
import Enemy from './Enemy'
import Hero from './Hero'

export default function CharacterTab() {
	const [_, selectedCharacterType] = useSettingsPanelStore(state => state.selectedCharacter)

	switch (selectedCharacterType) {
		case 'HERO': return <Hero />
		case 'ENEMY': return <Enemy />
	}
}
