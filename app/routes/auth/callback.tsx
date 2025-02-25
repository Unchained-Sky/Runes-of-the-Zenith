import { redirect, type LoaderFunctionArgs } from '@remix-run/node'
import { getServerClient } from '~/supabase/getServerClient'

export async function loader({ request }: LoaderFunctionArgs) {
	const requestUrl = new URL(request.url)
	const code = requestUrl.searchParams.get('code')
	const next = requestUrl.searchParams.get('next') ?? '/'

	const { supabase, headers } = getServerClient(request)

	if (code) {
		const { error } = await supabase.auth.exchangeCodeForSession(code)
		if (!error) {
			return redirect(next, { headers })
		}
	}

	return redirect('/auth/error', { headers })
}
