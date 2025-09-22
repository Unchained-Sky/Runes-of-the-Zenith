import { createFileRoute, redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { getSupabaseServerClient } from '~/supabase/getSupabaseServerClient'

export const Route = createFileRoute('/auth/logout')({
	preload: false,
	loader: async () => await serverLoader()
})

const serverLoader = createServerFn({ method: 'POST' })
	.handler(async () => {
		const supabase = getSupabaseServerClient()
		const { error } = await supabase.auth.signOut()
		if (error) throw new Error(error.message, { cause: error })
		throw redirect({ to: '/' })
	})
