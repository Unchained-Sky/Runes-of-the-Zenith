import { type SupabaseClient } from '@supabase/supabase-js'
import { createContext, useContext, useEffect, useState } from 'react'
import { type Database } from './databaseTypes'

export const SupabaseContext = createContext<SupabaseClient<Database> | null>(null)

export const useSupabase = () => {
	const supabase = useContext(SupabaseContext)

	const [userId, setUserId] = useState('')
	useEffect(() => {
		if (!supabase) return
		supabase.auth.getUser().then(({ data }) => {
			if (!data.user) return
			setUserId(data.user.id)
		}).catch(console.error)
	}, [supabase])

	if (!supabase) throw new Error('Supabase is not initialized')
	return { supabase, userId }
}
