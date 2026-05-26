import { useContext } from 'react'
import { type Enums } from '~/supabase/databaseTypes'
import { type TabletopGMEnemyData } from '../../$campaignId.gm/-hooks/tabletopData/useGMTabletopEnemies'
import { type TabletopHeroData } from '../../-hooks/tabletopData/useTabletopHeroes'
import { EnemyWindowContext } from './Enemy/EnemyWindowContext'
import { HeroWindowContext } from './Hero/HeroWindowContext'

export default function useCharacterWindowContext() {
	const heroData = useContext(HeroWindowContext)
	const enemyData = useContext(EnemyWindowContext)
	const characterData = heroData ?? enemyData
	if (!characterData) throw new Error('Character Window Context not found')
	return {
		...characterData,
		characterType: heroData ? 'HERO' : 'ENEMY'
	} satisfies (TabletopHeroData | TabletopGMEnemyData) & { characterType: Enums<'character_type'> }
}
