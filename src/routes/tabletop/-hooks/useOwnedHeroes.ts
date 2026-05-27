import { useSupabase } from '~/supabase/useSupabase'
import { useTabletopHeroList, type TabletopHeroesList } from './tabletopData/useTabletopHeroList'
import { useTabletopEnvironmentStore } from './useTabletopEnvironmentStore'

type ActiveHero = TabletopHeroesList[number] & { tabletopCharacterId: number }

export default function useOwnedHeroes() {
	const { data: heroList } = useTabletopHeroList()
	const { userId } = useSupabase()
	const { role } = useTabletopEnvironmentStore()

	const isOwnedActiveHero = (hero: TabletopHeroesList[number]): hero is ActiveHero => (hero.userId === userId || role === 'gm') && !!hero.tabletopCharacterId

	return heroList.filter(isOwnedActiveHero)
}
