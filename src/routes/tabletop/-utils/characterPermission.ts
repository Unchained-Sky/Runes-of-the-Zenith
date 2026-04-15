import { createServerOnlyFn } from '@tanstack/react-start'
import { requireAccount } from '~/supabase/requireAccount'
import { useSupabase } from '~/supabase/useSupabase'
import { useTabletopHeroList } from '~/tt/-hooks/tabletopData/useTabletopHeroList'
import { useTabletopContext } from './TabletopContext'

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

type HasCharacterPermissionProps = {
	campaignId: number
} | {
	tabletopCharacterId: number
}

export const hasCharacterPermission = createServerOnlyFn(async (props: HasCharacterPermissionProps) => {
	const { user, supabase } = await requireAccount()

	const campaignId = 'campaignId' in props ? props.campaignId : null
	const tabletopCharacterId = 'tabletopCharacterId' in props ? props.tabletopCharacterId : null

	if (campaignId) {
		const { error } = await supabase
			.from('campaign_info')
			.select('user_id')
			.eq('campaign_id', campaignId)
			.eq('user_id', user.id)
			.limit(1)
			.single()
		if (error) throw new Error(error.message, { cause: error })

		return { supabase, user, campaignId }
	}

	if (tabletopCharacterId) {
		const { data, error } = await supabase
			.from('tabletop_characters')
			.select(`
				campaignId: campaign_id,
				campaign_info (
					gmUserId: user_id
				),
				tabletopHero: tabletop_heroes (
					heroInfo: hero_info (
						userId: user_id
					)
				)
			`)
			.eq('tt_character_id', tabletopCharacterId)
			.limit(1)
			.single()
		if (error) throw new Error(error.message, { cause: error })
		const isGm = data.campaign_info.gmUserId === user.id
		const isCharacterOwner = data.tabletopHero.at(0)?.heroInfo.userId === user.id
		if (!isGm && !isCharacterOwner) throw new Error('You do not have control permission over this character')

		return { supabase, user, campaignId: data.campaignId }
	}

	return { supabase, user, campaignId: 0 }
})
