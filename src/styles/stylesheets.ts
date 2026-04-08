import CSS_MANTINE_WINDOW from '@gfazioli/mantine-window/styles.css?url'
import CSS_MANTINE_CHARTS from '@mantine/charts/styles.css?url'
import CSS_MANTINE from '@mantine/core/styles.css?url'
import CSS_MANTINE_DROPZONE from '@mantine/dropzone/styles.css?url'
import CSS_MANTINE_NOTIFICATIONS from '@mantine/notifications/styles.css?url'
import CSS_NAVBAR from '~/components/Navbar/Navbar.css?url'
import CSS_FONT from '~/styles/font.css?url'

export const stylesheets = [
	CSS_MANTINE_WINDOW,
	CSS_MANTINE_CHARTS,
	CSS_MANTINE,
	CSS_MANTINE_DROPZONE,
	CSS_MANTINE_NOTIFICATIONS,
	CSS_NAVBAR,
	CSS_FONT
].map(url => ({ rel: 'stylesheet', href: url }))
