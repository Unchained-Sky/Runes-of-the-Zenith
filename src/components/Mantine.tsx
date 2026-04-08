import { Avatar, ColorSchemeScript, createTheme, type MantineColorScheme, MantineProvider, Tooltip } from '@mantine/core'
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
		}),
		Tooltip: Tooltip.extend({
			defaultProps: {
				color: 'gray'
			}
		})
	}
})

export default function Mantine({ children }: { children: ReactNode }) {
	return (
		<>
			<ColorSchemeScript defaultColorScheme={defaultColorScheme} />

			<MantineProvider defaultColorScheme={defaultColorScheme} theme={theme}>
				<Notifications />
				{children}
			</MantineProvider>
		</>
	)
}
