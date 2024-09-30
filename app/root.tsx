import { Box, ColorSchemeScript, Group } from '@mantine/core'
import { type LinksFunction } from '@remix-run/node'
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from '@remix-run/react'
import { type ReactNode } from 'react'
import Mantine, { defaultColorScheme } from '~/components/Mantine'
import Navbar from '~/components/Navbar'
import './styles/font.css'

export const links: LinksFunction = () => []

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
	return (
		<Group>
			<Navbar />
			<Box component='main' flex='1'>
				<Outlet />
			</Box>
		</Group>
	)
}
