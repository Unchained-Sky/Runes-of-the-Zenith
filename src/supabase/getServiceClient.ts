import { createClient } from '@supabase/supabase-js'
import { serverOnly } from '@tanstack/react-start'
import { type Database } from './databaseTypes'
import { getSupabaseServerEnv } from './supabaseEnv'

export const getServiceClient = serverOnly(() => {
	const { SUPABASE_URL, SUPABASE_SERVICE_ROLE } = getSupabaseServerEnv()

	return createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_ROLE, {
		auth: {
			persistSession: false,
			autoRefreshToken: false,
			detectSessionInUrl: false
		}
	})
})
