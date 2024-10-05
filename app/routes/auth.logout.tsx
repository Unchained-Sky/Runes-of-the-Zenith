import { type ActionFunctionArgs, redirect } from '@remix-run/node'
import { getServerClient } from '~/supabase/getServerClient'

export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.formData()
	const backlink = formData.get('_backlink')

	const { supabase, headers } = getServerClient(request)

	await supabase.auth.signOut()
	return redirect(typeof backlink === 'string' ? backlink : '/', { headers })
}
