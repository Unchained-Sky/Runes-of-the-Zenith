import { ColorSchemeScript } from '@mantine/core'
import { type LinksFunction } from '@remix-run/node'
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from '@remix-run/react'
import { type ReactNode } from 'react'
import Mantine from './components/Mantine'

// eslint-disable-next-line react-refresh/only-export-components
export const links: LinksFunction = () => []

export function Layout({ children }: { children: ReactNode }) {
	return (
		<html lang='en'>
			<head>
				<meta charSet='utf-8' />
				<meta name='viewport' content='width=device-width, initial-scale=1' />
				<Meta />
				<Links />
				<ColorSchemeScript defaultColorScheme='dark' />
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
	return <Outlet />
}
