import '@mantine/core/styles.css'

import '@gfazioli/mantine-window/styles.css'
import '@mantine/dropzone/styles.css'
import '@mantine/notifications/styles.css'

import { Avatar, createTheme, type MantineColorScheme, MantineProvider } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import { type ReactNode } from 'react'

const defaultColorScheme: MantineColorScheme = 'dark'

const theme = createTheme({
	primaryColor: 'violet',
	components: {
		Avatar: Avatar.extend({
			defaultProps: {
				imageProps: {
					draggable: false
				}
			}
		})
	}
})

export default function Mantine({ children }: { children: ReactNode }) {
	return (
		<MantineProvider defaultColorScheme={defaultColorScheme} theme={theme}>
			<Notifications />
			{children}
		</MantineProvider>
	)
}
