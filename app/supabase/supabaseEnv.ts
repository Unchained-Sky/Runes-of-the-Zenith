type SupabaseEnv = {
	SUPABASE_URL: string
	SUPABASE_ANON_KEY: string
}

export function getSupabaseEnv(options: Partial<SupabaseEnv> = {}) {
	if (!process.env.SUPABASE_URL) {
		throw new Error('SUPABASE_URL env is missing')
	}

	if (!process.env.SUPABASE_ANON_KEY) {
		throw new Error('SUPABASE_ANON_KEY env is missing')
	}

	return {
		SUPABASE_URL: options.SUPABASE_URL ?? process.env.SUPABASE_URL,
		SUPABASE_ANON_KEY: options.SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY
	} satisfies SupabaseEnv
}
