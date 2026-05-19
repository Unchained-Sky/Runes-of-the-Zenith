import { type WindowProps } from '@gfazioli/mantine-window'

export type CustomWindowProps = {
	opened: boolean
	onClose: () => void
}

export const DEFAULT_WINDOW_PROPS = {
	defaultX: 316,
	defaultY: 16,
	maxHeight: '100vh',
	resizable: 'both',
	fullSizeResizeHandles: true,
	draggable: 'header',
	styles: {
		header: {
			cursor: 'move'
		}
	}
} satisfies WindowProps
