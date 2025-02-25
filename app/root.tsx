import { Box, ColorSchemeScript, Group } from '@mantine/core'
import { type LinksFunction, type LoaderFunctionArgs } from '@remix-run/node'
import { Links, Meta, Outlet, Scripts, ScrollRestoration, useLoaderData } from '@remix-run/react'
import { type ReactNode } from 'react'
import Mantine, { defaultColorScheme } from '~/components/Mantine'
import Navbar from '~/components/Navbar'
import { getUserId } from '~/supabase/getUserId'
import { getUserIdentity } from '~/supabase/getUserIdentity'
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

	return {
		userIdentity,
		campaignCount: campaignCount ?? 0,
		characterCount: characterCount ?? 0
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

export default function App() {
	const { userIdentity, campaignCount, characterCount } = useLoaderData<typeof loader>()

	return (
		<Group align='flex-start'>
			<NavbarContext.Provider value={{ userIdentity, campaignCount, characterCount }}>
				<Navbar />
			</NavbarContext.Provider>

			<Box component='main' flex='1' pt='md'>
				<Outlet />
			</Box>
		</Group>
	)
}
