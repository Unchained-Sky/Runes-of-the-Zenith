import { createServerClient, parseCookieHeader, serializeCookieHeader } from '@supabase/ssr'
import { type Database } from './databaseTypes'
import { getSupabaseEnv } from './supabaseEnv'

export function getServerClient(request: Request) {
	const headers = new Headers()

	const { SUPABASE_URL, SUPABASE_ANON_KEY } = getSupabaseEnv()

	const supabase = createServerClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
		cookies: {
			getAll() {
				return parseCookieHeader(request.headers.get('Cookie') ?? '')
			},
			setAll(cookiesToSet) {
				cookiesToSet.forEach(({ name, value, options }) =>
					headers.append('Set-Cookie', serializeCookieHeader(name, value, options))
				)
			}
		}
	})

	return {
		supabase,
		headers
	}
}
