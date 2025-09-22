import { createFileRoute, redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { type } from 'arktype'
import { getSupabaseServerClient } from '~/supabase/getSupabaseServerClient'
import { type FormResponse } from '~/types/formResponse'

const authLoginSearchSchema = type({
	'backlink?': 'string'
})

export const Route = createFileRoute('/auth/login')({
	preload: false,
	validateSearch: authLoginSearchSchema,
	loaderDeps: ({ search }) => search,
	loader: async ({ deps: search }) => await serverLoader({
		data: { backlink: search.backlink }
	})
})

const serverLoader = createServerFn({ method: 'POST' })
	.validator((data: { backlink?: string }) => data)
	.handler(async ({ data: { backlink } }) => {
		const supabase = getSupabaseServerClient()
		const { data, error } = await supabase.auth.signInWithOAuth({
			provider: 'discord',
			options: {
				redirectTo: `http://localhost:3000/auth/callback?next=${backlink ?? '/'}`
			}
		})

		if (error) {
			return {
				error: true,
				message: error.message
			} satisfies FormResponse
		}

		throw redirect({ href: data.url })
	})
