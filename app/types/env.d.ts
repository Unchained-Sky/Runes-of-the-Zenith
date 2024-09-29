type Env =
	| 'SUPABASE_URL'
	| 'SUPABASE_ANON_KEY'
	| 'BASE_URL'
	| 'PORT'

declare namespace NodeJS {
	// eslint-disable-next-line @typescript-eslint/no-empty-object-type
	interface ProcessEnv extends Partial<Record<Env, string>> {}
}
