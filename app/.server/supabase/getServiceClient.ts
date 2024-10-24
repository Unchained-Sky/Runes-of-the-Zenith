import { createClient } from '@supabase/supabase-js'
import { type Database } from './databaseTypes'
import { getSupabaseEnv } from './supabaseEnv'

export function getServiceClient() {
	const { SUPABASE_URL, SUPABASE_SERVICE_ROLE } = getSupabaseEnv()

	return createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_ROLE, {
		auth: {
			persistSession: false,
			autoRefreshToken: false,
			detectSessionInUrl: false
		}
	})
}
