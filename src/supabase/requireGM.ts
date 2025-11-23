import { serverOnly } from '@tanstack/react-start'
import { requireAccount } from './requireAccount'

type RequireGMProps = {
	campaignId: number
	backlink?: string
}

export const requireGM = serverOnly(async ({ campaignId, backlink }: RequireGMProps) => {
	const { supabase, user } = await requireAccount({ backlink: backlink ?? '/' })

	const { error } = await supabase
		.from('campaign_info')
		.select('user_id')
		.eq('campaign_id', campaignId)
		.eq('user_id', user.id)
		.limit(1)
		.single()
	if (error) throw new Error(error.message, { cause: error })

	return { supabase, user }
})
