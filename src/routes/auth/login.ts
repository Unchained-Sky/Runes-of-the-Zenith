import { createFileRoute, redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { type } from 'arktype'
import { getSupabaseServerClient } from '~/supabase/getSupabaseServerClient'

const loginSearchSchema = type({
	'backlink?': 'string'
})

export const Route = createFileRoute('/auth/login')({
	preload: false,
	validateSearch: search => {
		const validator = loginSearchSchema(search)
		if (validator instanceof type.errors) {
			throw new Error(validator.summary)
		}
		return {
			backlink: validator.backlink ?? '/'
		}
	},
	loaderDeps: ({ search }) => search,
	loader: async ({ deps: search, location }) => {
		return await serverLoader({
			data: {
				origin: location.url.origin,
				backlink: search.backlink
			}
		})
	}
})

const authLoginSearchSchema = type({
	origin: 'string',
	backlink: 'string'
})

const serverLoader = createServerFn({ method: 'POST' })
	.inputValidator(authLoginSearchSchema)
	.handler(async ({ data: { origin, backlink } }) => {
		const supabase = getSupabaseServerClient()
		const { data, error } = await supabase.auth.signInWithOAuth({
			provider: 'discord',
			options: {
				redirectTo: `${origin}/auth/callback?next=${backlink}`
			}
		})

		if (error) throw new Error(error.message, { cause: error })

		throw redirect({ href: data.url })
	})
