import { createTheme, type MantineColorScheme, MantineProvider } from '@mantine/core'
import '@mantine/core/styles.css'
import { type ReactNode } from 'react'

const defaultColorScheme: MantineColorScheme = 'dark'

const theme = createTheme({
	primaryColor: 'violet'
})

export default function Mantine({ children }: { children: ReactNode }) {
	return (
		<MantineProvider defaultColorScheme={defaultColorScheme} theme={theme}>
			{children}
		</MantineProvider>
	)
}
