import { redirect } from '@remix-run/react'
import { type SupabaseClient } from '@supabase/supabase-js'
import { type Database } from '~/supabase/databaseTypes'

export async function getCampaignData<T extends string>(select: T, campaignId: number, { supabase, headers }: { supabase: SupabaseClient<Database>, headers: Headers }) {
	const { data, error } = campaignId
		? await supabase
			.from('campaign_info')
			.select(select)
			.eq('campaign_id', campaignId)
		: { data: [] }
	if (error || !data.length) throw redirect('/', { headers })
	return data[0]
}
