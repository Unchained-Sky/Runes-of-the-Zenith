import { type SupabaseClient } from '@supabase/supabase-js'
import { getRouteApi } from '@tanstack/react-router'
import { type Database } from '~/supabase/databaseTypes'
import { useSupabase } from '~/supabase/useSupabase'
import useTabletopCharactersSubscription from './useTabletopCharactersSubscription'
import useTabletopHeroesSubscription from './useTabletopHeroesSubscription'
import useTabletopInfoSubscription from './useTabletopInfoSubscription'
import useTabletopTilesSubscription from './useTabletopTilesSubscription'

export const LOG_SUBSCRIPTION_PAYLOADS = process.env.NODE_ENV === 'development'

export default function useTabletopGMSubscription() {
	const supabase = useSupabase()

	const { campaignId } = getRouteApi('/tabletop/$campaignId/gm/').useLoaderData()

	useTabletopCharactersSubscription({ supabase, campaignId })
	useTabletopHeroesSubscription({ supabase, campaignId })
	useTabletopInfoSubscription({ supabase, campaignId })
	useTabletopTilesSubscription({ supabase, campaignId })
}

export type SubscribeHookProps = {
	supabase: SupabaseClient<Database>
	campaignId: number
}
