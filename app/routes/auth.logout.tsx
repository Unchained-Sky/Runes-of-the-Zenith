import { type ActionFunctionArgs, redirect } from '@remix-run/node'
import { getServerClient } from '~/supabase/getServerClient'

export async function action({ request }: ActionFunctionArgs) {
	const { supabase, headers } = getServerClient(request)

	const { error } = await supabase.auth.signOut()
	if (error) throw new Error(error.message, { cause: error })

	return redirect('/', { headers })
}
