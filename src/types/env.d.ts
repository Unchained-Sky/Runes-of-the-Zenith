type Env =
	| 'SUPABASE_URL'
	| 'SUPABASE_ANON_KEY'
	| 'SUPABASE_SERVICE_ROLE'

declare namespace NodeJS {
	// oxlint-disable-next-line typescript/no-empty-object-type
	interface ProcessEnv extends Partial<Record<Env, string>> {}
}
