import { useSupabase } from '~/supabase/useSupabase'
import { useTabletopContext } from '../-utils/TabletopContext'
import { useTabletopHeroList, type TabletopHeroesList } from './tabletopData/useTabletopHeroList'

type ActiveHero = TabletopHeroesList[number] & { tabletopCharacterId: number }

export default function useOwnedHeroes() {
	const { data: heroList } = useTabletopHeroList()
	const { userId } = useSupabase()
	const { role } = useTabletopContext()

	const isOwnedActiveHero = (hero: TabletopHeroesList[number]): hero is ActiveHero => (hero.userId === userId || role === 'gm') && !!hero.tabletopCharacterId

	return heroList.filter(isOwnedActiveHero)
}
