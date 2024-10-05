import { type ActionFunctionArgs } from '@remix-run/node'
import { redirect } from '@remix-run/react'
import { type Provider } from '@supabase/supabase-js'
import getUrlBase from 'app/.server/utils/getUrlBase'
import { getServerClient } from '~/supabase/getServerClient'

export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.formData()
	const intent = formData.get('_intent') as Provider
	const backlink = formData.get('_backlink')

	const { supabase, headers } = getServerClient(request)

	const { data } = await supabase.auth.signInWithOAuth({
		provider: intent,
		options: {
			redirectTo: `${getUrlBase()}/auth/callback?next=${typeof backlink === 'string' ? backlink : '/'}`
		}
	})

	return redirect(data.url ?? '/', { headers })
}
