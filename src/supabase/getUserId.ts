import { type SupabaseClient } from '@supabase/supabase-js'
import { createServerOnlyFn } from '@tanstack/react-start'
import { getSupabaseServerClient } from './getSupabaseServerClient'

type GetUserIdReturn = {
	userId: string
	supabase: SupabaseClient
}

export const getUserId = createServerOnlyFn(async (supabase?: SupabaseClient) => {
	if (!supabase) supabase = getSupabaseServerClient()

	const { data: sessionData } = await supabase.auth.getSession()
	if (!sessionData.session) return {
		userId: '',
		supabase
	} satisfies GetUserIdReturn

	const { data: userData, error } = await supabase.auth.getUser()
	if (error) throw new Error(error.message, { cause: error })

	return {
		userId: userData.user.id,
		supabase
	} satisfies GetUserIdReturn
})
