import { type ActionFunctionArgs } from '@remix-run/node'
import { redirect } from '@remix-run/react'
import { type Provider } from '@supabase/supabase-js'
import { getServerClient } from '~/supabase/getServerClient'

export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.formData()
	const intent = formData.get('_intent') as Provider
	const backlink = formData.get('_backlink')

	const { supabase, headers } = getServerClient(request)

	const baseUrl = request.url.split('/auth/login')[0]

	const { data } = await supabase.auth.signInWithOAuth({
		provider: intent,
		options: {
			redirectTo: `${baseUrl}/auth/callback?next=${typeof backlink === 'string' ? backlink : '/'}`
		}
	})

	return redirect(data.url ?? '/', { headers })
}
