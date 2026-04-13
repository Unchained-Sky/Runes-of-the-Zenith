import { useSupabase } from '~/supabase/useSupabase'
import { useTabletopContext } from '../-utils/TabletopContext'
import { useTabletopHeroList } from './tabletopData/useTabletopHeroList'

export function useCharacterPermission(tabletopCharacterId: number) {
	const { role } = useTabletopContext()

	const { userId } = useSupabase()
	const { data: heroList } = useTabletopHeroList()

	if (role === 'gm') return true

	const hero = heroList.find(hero => hero.tabletopCharacterId === tabletopCharacterId)
	if (!hero) return false
	if (hero.userId === userId) return true

	return false
}
