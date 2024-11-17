import { redirect } from '@remix-run/react'
import { type SupabaseClient } from '@supabase/supabase-js'
import { type Database } from '~/supabase/databaseTypes'

export async function getCharacterData<T extends string>(select: T, characterId: number, { supabase, headers }: { supabase: SupabaseClient<Database>, headers: Headers }) {
	const { data, error } = await supabase
		.from('character_info')
		.select(select)
		.eq('character_id', characterId)
	if (error || !data.length) throw redirect('/', { headers })
	return data[0]
}
