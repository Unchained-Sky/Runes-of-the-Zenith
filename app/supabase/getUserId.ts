import { getServerClient } from './getServerClient'

type GetUserIdOptions = ReturnType<typeof getServerClient> | Request

function isRequest(options: GetUserIdOptions): options is Request {
	return !Object.hasOwn(options, 'supabase')
}

export async function getUserId(options: GetUserIdOptions) {
	const { supabase, headers } = isRequest(options)
		? getServerClient(options)
		: options

	const { data, error } = await supabase.auth.getUser()
	if (error) throw new Error(error.message, { cause: error })

	return {
		supabase,
		headers,
		userId: data.user.id
	}
}
