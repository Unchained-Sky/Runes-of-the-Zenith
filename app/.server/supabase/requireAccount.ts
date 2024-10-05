import { redirect } from '@remix-run/react'
import { getServerClient } from './getServerClient'

export async function requireAccount(request: Request) {
	const { supabase, headers } = getServerClient(request)

	const { data: { user } } = await supabase.auth.getUser()

	if (!user) throw redirect('/login', { headers })

	return {
		supabase,
		headers
	}
}
