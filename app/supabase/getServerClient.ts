import { createServerClient, parseCookieHeader, serializeCookieHeader } from '@supabase/ssr'
import { type Database } from './databaseTypes'

type Options = {
	supabaseUrl?: string
	supabaseAnonKey?: string
}

export function getServerClient(request: Request, options?: Options) {
	const headers = new Headers()

	if (!process.env.SUPABASE_URL) {
		throw new Error('SUPABASE_URL env is missing')
	}

	if (!process.env.SUPABASE_ANON_KEY) {
		throw new Error('SUPABASE_ANON_KEY env is missing')
	}

	const env = {
		SUPABASE_URL: options?.supabaseUrl ?? process.env.SUPABASE_URL,
		SUPABASE_ANON_KEY: options?.supabaseAnonKey ?? process.env.SUPABASE_ANON_KEY
	} as const

	const supabase = createServerClient<Database>(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
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
