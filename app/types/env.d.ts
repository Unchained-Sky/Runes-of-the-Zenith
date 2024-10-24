type Env =
	| 'SUPABASE_URL'
	| 'SUPABASE_ANON_KEY'
	| 'SUPABASE_SERVICE_ROLE'
	| 'BASE_URL'
	| 'PORT'

declare namespace NodeJS {
	// eslint-disable-next-line @typescript-eslint/no-empty-object-type
	interface ProcessEnv extends Partial<Record<Env, string>> {}
}
