import { type SupabaseClient } from '@supabase/supabase-js'
import { createContext, useContext } from 'react'
import { type Database } from './databaseTypes'

export const SupabaseContext = createContext<SupabaseClient<Database> | null>(null)

export const useSupabase = () => {
	const supabase = useContext(SupabaseContext)
	if (!supabase) throw new Error('Supabase is not initialized')
	return supabase
}
