import { type SupabaseClient } from '@supabase/supabase-js'
import { getRouteApi } from '@tanstack/react-router'
import { type Database } from '~/supabase/databaseTypes'
import { useSupabase } from '~/supabase/useSupabase'
import useTabletopCharactersSubscription from './useTabletopCharactersSubscription'
import useTabletopHeroesSubscription from './useTabletopHeroesSubscription'
import useTabletopInfoSubscription from './useTabletopInfoSubscription'

export const LOG_SUBSCRIPTION_PAYLOADS = process.env.NODE_ENV === 'development'

export default function useTabletopGMSubscription() {
	const supabase = useSupabase()

	const { campaignId } = getRouteApi('/tabletop/$campaignId/gm/').useLoaderData()

	useTabletopHeroesSubscription({ supabase, campaignId })
	useTabletopInfoSubscription({ supabase, campaignId })
	useTabletopCharactersSubscription({ supabase, campaignId })
}

export type SubscribeHookProps = {
	supabase: SupabaseClient<Database>
	campaignId: number
}
