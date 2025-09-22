import { Box, Group } from '@mantine/core'
import { createBrowserClient } from '@supabase/ssr'
import { TanstackDevtools } from '@tanstack/react-devtools'
import { type QueryClient } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { HeadContent, Outlet, Scripts, createRootRouteWithContext } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { useState, type ReactNode } from 'react'
import { DefaultCatchBoundary } from '~/components/DefaultCatchBoundary'
import Mantine from '~/components/Mantine'
import Navbar from '~/components/Navbar'
import '~/styles/font.css'
import { type Database } from '~/supabase/databaseTypes'
import { getSupabaseClientEnv } from '~/supabase/supabaseEnv'
import { SupabaseContext } from '~/supabase/useSupabase'

export const Route = createRootRouteWithContext<{
	queryClient: QueryClient
}>()({
	shellComponent: RootComponent,
	errorComponent: DefaultCatchBoundary,
	loader: async () => {
		const supabaseClientEnv = await getSupabaseClientEnv()
		return {
			supabaseClientEnv
		}
	},
	head: () => ({
		meta: [
			{ charSet: 'utf-8' },
			{ name: 'viewport', content: 'width=device-width, initial-scale=1' },
			{ title: 'Runes of the Zenith' }
		]
	})
})

function RootComponent() {
	const { supabaseClientEnv } = Route.useLoaderData()
	const [supabase] = useState(() => createBrowserClient<Database>(
		supabaseClientEnv.SUPABASE_URL,
		supabaseClientEnv.SUPABASE_ANON_KEY)
	)

	return (
		<RootDocument>
			<SupabaseContext.Provider value={supabase}>
				<Outlet />
			</SupabaseContext.Provider>
		</RootDocument>
	)
}

function RootDocument({ children }: { children: ReactNode }) {
	return (
		<html lang='en'>
			<head>
				<HeadContent />
			</head>
			<body>
				<RootLayout>
					{children}
				</RootLayout>
				<TanstackDevtools
					config={{
						position: 'bottom-left'
					}}
					plugins={[
						{
							name: 'Tanstack Router',
							render: <TanStackRouterDevtoolsPanel />
						},
						{
							name: 'React Query',
							render: <ReactQueryDevtools />
						}
					]}
				/>
				<Scripts />
			</body>
		</html>
	)
}

function RootLayout({ children }: { children: ReactNode }) {
	return (
		<Mantine>
			<Group align='flex-start' gap={0}>
				<Navbar />
				<Box component='main' flex='1' p='md' pos='relative' mih='100vh'>
					{children}
				</Box>
			</Group>
		</Mantine>
	)
}
