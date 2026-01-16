import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { staticFunctionMiddleware } from '@tanstack/start-static-server-functions'
import { type Token } from '~/scripts/data/tokens/tokens'
import { getSupabaseServerClient } from '~/supabase/getSupabaseServerClient'

const tokenQueryAction = createServerFn({ method: 'GET' })
	.middleware([staticFunctionMiddleware])
	.handler(async () => {
		const supabase = getSupabaseServerClient()

		const { data, error } = await supabase
			.from('token_info')
			.select(`
				name,
				alignment,
				extraData
			`)
			.overrideTypes<Token[], { merge: false }>()
		if (error) throw new Error(error.message, { cause: error })

		return Object.fromEntries(data.map<[string, Token]>(token => [token.name, token]))
	})

export const tokenQueryOptions = queryOptions({
	queryKey: ['core-data', 'token'],
	queryFn: tokenQueryAction,
	staleTime: Infinity
})

export const useTokenQuery = () => {
	return useSuspenseQuery(tokenQueryOptions).data
}
