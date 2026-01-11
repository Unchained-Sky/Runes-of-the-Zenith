import { createServerClient } from '@supabase/ssr'
import { createServerOnlyFn } from '@tanstack/react-start'
import { getCookies, setCookie } from '@tanstack/react-start/server'
import { type Database } from './databaseTypes'
import { getSupabaseServerEnv } from './supabaseEnv'

export const getSupabaseServerClient = createServerOnlyFn(() => {
	const { SUPABASE_URL, SUPABASE_ANON_KEY } = getSupabaseServerEnv()

	return createServerClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
		cookies: {
			getAll() {
				return Object.entries(getCookies()).map(([name, value]) => ({
					name,
					value
				}))
			},
			setAll(cookies) {
				cookies.forEach(cookie => {
					setCookie(cookie.name, cookie.value)
				})
			}
		}
	})
})
