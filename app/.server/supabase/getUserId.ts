import { type SupabaseClient } from '@supabase/supabase-js'
import { type Database } from './databaseTypes'
import { getServerClient } from './getServerClient'

function isRequest(options: GetUserIdOptions): options is Request {
	return !Object.hasOwn(options, 'auth')
}

type UserIdReturn = {
	supabase: SupabaseClient<Database>
	userId: string
}

type GetUserIdOptions = SupabaseClient<Database> | Request

export function getUserId(options: SupabaseClient<Database>): Promise<UserIdReturn>
export function getUserId(options: Request): Promise<UserIdReturn & { headers: Headers }>

export async function getUserId(options: GetUserIdOptions) {
	if (isRequest(options)) {
		const { supabase, headers } = getServerClient(options)
		const userId = await id(supabase)

		return {
			supabase,
			headers,
			userId
		} satisfies UserIdReturn & { headers: Headers }
	} else {
		const userId = await id(options)
		return {
			supabase: options,
			userId
		} satisfies UserIdReturn
	}
}

async function id(supabase: SupabaseClient<Database>) {
	const { data, error } = await supabase.auth.getUser()
	if (error) throw new Error(error.message, { cause: error })
	return data.user.id
}
