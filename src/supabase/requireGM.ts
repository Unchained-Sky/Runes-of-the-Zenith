import { serverOnly } from '@tanstack/react-start'
import { requireAccount } from './requireAccount'

type RequireGMProps = ({
	campaignId: number
} | {
	tabletopCharacterId: number
}) & {
	backlink?: string
}

export const requireGM = serverOnly(async ({ backlink, ...props }: RequireGMProps) => {
	const { supabase, user } = await requireAccount({ backlink: backlink ?? '/' })

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
				)
			`)
			.eq('tt_character_id', tabletopCharacterId)
			.limit(1)
			.single()
		if (error) throw new Error(error.message, { cause: error })
		if (data.campaign_info.gmUserId !== user.id) throw new Error('You are not the GM of this campaign')

		return { supabase, user, campaignId: data.campaignId }
	}

	return { supabase, user, campaignId: 0 }
})
