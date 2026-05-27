import { type QueryClient } from '@tanstack/react-query'
import { type TabletopEnemyList, useTabletopEnemyList } from '../-hooks/tabletopData/useTabletopEnemyList'
import { type TabletopHeroesList, useTabletopHeroList } from '../-hooks/tabletopData/useTabletopHeroList'
import { useTabletopEnvironmentStore } from '../-hooks/useTabletopEnvironmentStore'

export function useCharacterLookup() {
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

type QueryCharacterLookupProps = {
	queryClient: QueryClient
	tabletopCharacterId: number
}

export function queryCharacterLookup({ queryClient, tabletopCharacterId }: QueryCharacterLookupProps) {
	const { campaignId } = useTabletopEnvironmentStore.getState()

	const heroList = queryClient.getQueryData<TabletopHeroesList>([campaignId, 'tabletop', 'hero-list'])
	const hero = heroList?.find(hero => hero.tabletopCharacterId === tabletopCharacterId)
	if (hero) return 'HERO'

	const enemyList = queryClient.getQueryData<TabletopEnemyList>([campaignId, 'tabletop', 'enemy-list'])
	const enemy = enemyList?.find(enemy => enemy === tabletopCharacterId)
	if (enemy) return 'ENEMY'

	throw new Error('Invalid character id')
}
