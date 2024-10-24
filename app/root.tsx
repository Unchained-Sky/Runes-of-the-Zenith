import { Box, ColorSchemeScript, Group } from '@mantine/core'
import { type LinksFunction, type LoaderFunctionArgs } from '@remix-run/node'
import { json, Links, Meta, Outlet, Scripts, ScrollRestoration, useLoaderData } from '@remix-run/react'
import { type ReactNode } from 'react'
import Mantine, { defaultColorScheme } from '~/components/Mantine'
import Navbar from '~/components/Navbar'
import { getUserIdentity } from '~/supabase/getUserIdentity'
import './styles/font.css'

export const links: LinksFunction = () => []

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const { userIdentity, headers } = await getUserIdentity(request)
	return json({ userIdentity }, { headers })
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
	const { userIdentity } = useLoaderData<typeof loader>()

	return (
		<Group align='flex-start'>
			<Navbar userIdentity={userIdentity} />
			<Box component='main' flex='1' pt='md'>
				<Outlet />
			</Box>
		</Group>
	)
}
