import { getServerClient } from './getServerClient'

export type UserIdentityData = UserIdentityDiscordData | null

type UserIdentityDiscordData = {
	avatar_url: string
	custom_claims: {
		global_name: string
	}
	email: string
	email_verified: boolean
	full_name: string
	iss: string
	name: string
	picture: string
	provider_id: string
	sub: string
}

export async function getUserIdentity(request: Request) {
	const { supabase, headers } = getServerClient(request)
	const { data } = await supabase.auth.getUserIdentities()
	const identityData = data?.identities[0].identity_data ?? null
	return {
		userIdentity: identityData as UserIdentityData,
		headers
	}
}
