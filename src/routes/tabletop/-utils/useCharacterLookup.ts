import { useTabletopEnemyList } from '../-hooks/tabletopData/useTabletopEnemyList'
import { useTabletopHeroList } from '../-hooks/tabletopData/useTabletopHeroList'

export default function useCharacterLookup() {
	const { data: heroList } = useTabletopHeroList()
	const { data: enemyList } = useTabletopEnemyList()

	return (tabletopCharacterId: number) => {
		const hero = heroList.find(hero => hero.tabletopCharacterId === tabletopCharacterId)
		if (hero) return 'HERO'

		const enemy = enemyList.find(enemy => enemy === tabletopCharacterId)
		if (enemy) return 'ENEMY'

		throw new Error('Invalid character id')
	}
}
