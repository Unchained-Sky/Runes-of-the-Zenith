import { redirect } from '@tanstack/react-router'
import { createServerOnlyFn } from '@tanstack/react-start'
import { getSupabaseServerClient } from './getSupabaseServerClient'

type RequireAccountProps = {
	backlink?: string
}

export const requireAccount = createServerOnlyFn(async (props: RequireAccountProps = {}) => {
	const supabase = getSupabaseServerClient()
	const { data: userData } = await supabase.auth.getUser()
	if (!userData.user) throw redirect({
		to: '/auth/login',
		params: { backlink: props.backlink },
		search: { backlink: props.backlink ?? '/' }
	})
	return {
		supabase,
		user: userData.user
	}
})
