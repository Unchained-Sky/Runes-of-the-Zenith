import { createFileRoute, redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { type } from 'arktype'
import { getSupabaseServerClient } from '~/supabase/getSupabaseServerClient'

const authCallbackSearchSchema = type({
	'code': 'string',
	'next?': 'string'
})

export const Route = createFileRoute('/auth/callback')({
	preload: false,
	validateSearch: authCallbackSearchSchema,
	loaderDeps: ({ search }) => search,
	loader: async ({ deps: search }) => await serverLoader({ data: search })
})

const serverLoader = createServerFn({ method: 'GET' })
	.validator(authCallbackSearchSchema)
	.handler(async ({ data }) => {
		const supabase = getSupabaseServerClient()
		const { error } = await supabase.auth.exchangeCodeForSession(data.code)
		if (error) throw new Error(error.message, { cause: error })
		throw redirect({ to: data.next ?? '/' })
	})
