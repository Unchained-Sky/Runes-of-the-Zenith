import { Box, ColorSchemeScript, Group } from '@mantine/core'
import { type LinksFunction, type LoaderFunctionArgs } from '@remix-run/node'
import { Links, Meta, Outlet, Scripts, ScrollRestoration, useLoaderData } from '@remix-run/react'
import { createBrowserClient } from '@supabase/ssr'
import { type SupabaseClient } from '@supabase/supabase-js'
import { useState, type ReactNode } from 'react'
import Mantine, { defaultColorScheme } from '~/components/Mantine'
import Navbar from '~/components/Navbar'
import { type Database } from '~/supabase/databaseTypes'
import { getUserId } from '~/supabase/getUserId'
import { getUserIdentity } from '~/supabase/getUserIdentity'
import { getSupabaseEnv } from '~/supabase/supabaseEnv'
import { NavbarContext } from './components/Navbar/NavbarContext'
import './styles/font.css'

export const links: LinksFunction = () => []

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const { userIdentity, supabase } = await getUserIdentity(request)

	const { count: campaignCount } = await supabase
		.from('campaign_info')
		.select('', { count: 'exact' })

	const { userId } = await getUserId(supabase)

	const { count: characterCount } = await supabase
		.from('character_info')
		.select('', { count: 'exact' })
		.eq('user_id', userId)

	const { SUPABASE_URL, SUPABASE_ANON_KEY } = getSupabaseEnv()

	return {
		userIdentity,
		campaignCount: campaignCount ?? 0,
		characterCount: characterCount ?? 0,
		supabaseEnv: { SUPABASE_URL, SUPABASE_ANON_KEY }
	}
}

export function Layout({ children }: { children: ReactNode }) {
	return (
		<html lang='en'>
			<head>
				<meta charSet='utf-8' />
				<meta name='viewport' content='width=device-width, initial-scale=1' />
				<Meta />
				<Links />
				<ColorSchemeScript defaultColorScheme={defaultColorScheme} />
			</head>
			<body>
				<Mantine>
					{children}
				</Mantine>
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	)
}

export type OutletContext = { supabase: SupabaseClient<Database> }

export default function App() {
	const { userIdentity, campaignCount, characterCount, supabaseEnv } = useLoaderData<typeof loader>()

	const [supabase] = useState(() => createBrowserClient<Database>(supabaseEnv.SUPABASE_URL, supabaseEnv.SUPABASE_ANON_KEY))

	return (
		<Group align='flex-start'>
			<NavbarContext.Provider value={{ userIdentity, campaignCount, characterCount }}>
				<Navbar />
			</NavbarContext.Provider>

			<Box component='main' flex='1' pt='md'>
				<Outlet context={{ supabase } satisfies OutletContext} />
			</Box>
		</Group>
	)
}
