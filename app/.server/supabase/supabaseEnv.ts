type SupabaseEnv = {
	SUPABASE_URL: string
	SUPABASE_ANON_KEY: string
	SUPABASE_SERVICE_ROLE: string
}

export function getSupabaseEnv(override: Partial<SupabaseEnv> = {}) {
	if (!process.env.SUPABASE_URL) {
		throw new Error('SUPABASE_URL env is missing')
	}

	if (!process.env.SUPABASE_ANON_KEY) {
		throw new Error('SUPABASE_ANON_KEY env is missing')
	}

	if (!process.env.SUPABASE_SERVICE_ROLE) {
		throw new Error('SUPABASE_SERVICE_ROLE env is missing')
	}

	return {
		SUPABASE_URL: override.SUPABASE_URL ?? process.env.SUPABASE_URL,
		SUPABASE_ANON_KEY: override.SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY,
		SUPABASE_SERVICE_ROLE: override.SUPABASE_SERVICE_ROLE ?? process.env.SUPABASE_SERVICE_ROLE
	} satisfies SupabaseEnv
}
