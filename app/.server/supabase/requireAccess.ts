import { redirect } from '@remix-run/react'
import { type Database, type Tables } from './databaseTypes'
import { getUserId } from './getUserId'
import { requireAccount } from './requireAccount'

type TableName = keyof Database['public']['Tables']

type Column<T extends TableName> = {
	[K in T]: Tables<T>
}[T]

type RequireAccessOptions<T extends TableName, K extends keyof Column<T>> = {
	table: T
	userColumn: keyof Column<T> & string
	selectColumn: K & string
	selectValue: Column<T>[K]
	onFailRedirectTo?: `/${string}`
}

export async function requireAccess<T extends TableName, K extends keyof Column<T>>(request: Request, {
	onFailRedirectTo = '/',
	table,
	userColumn,
	selectColumn,
	selectValue
}: RequireAccessOptions<T, K>) {
	const { supabase, headers } = await requireAccount(request)

	const { userId } = await getUserId(supabase)

	const { data, error } = await supabase
		.from(table)
		.select()
		.eq(userColumn, userId)
		.eq(selectColumn, selectValue as string)
	if (error || !data.length) throw redirect(onFailRedirectTo, { headers })

	return { supabase, headers }
}
