import { Box, useMantineTheme } from '@mantine/core'
import { type ReactNode } from 'react'
import { type CombatTileCord } from '~/data/mapTemplates/combat'
import useHexSize from './useHexSize'

type HexProps = {
	cord: CombatTileCord
	offset: [x: number, y: number]
	children?: ReactNode
}

export default function Hex({ cord, offset, children }: HexProps) {
	const { left, top, width, height, clipPath } = useHexSize(cord, offset)

	const theme = useMantineTheme()

	return (
		<Box
			pos='absolute'
			w={width}
			h={height}
			left={left}
			top={top}
		>
			<Box
				pos='absolute'
				bg={theme.primaryColor}
				style={{
					inset: 0,
					clipPath
				}}
			/>
			{children}
		</Box>
	)
}
