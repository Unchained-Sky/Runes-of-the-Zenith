import { MantineProvider } from '@mantine/core'
import '@mantine/core/styles.css'
import { type ReactNode } from 'react'

export default function Mantine({ children }: { children: ReactNode }) {
	return (
		<MantineProvider defaultColorScheme='dark'>
			{children}
		</MantineProvider>
	)
}
