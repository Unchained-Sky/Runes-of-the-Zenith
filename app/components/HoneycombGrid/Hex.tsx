import { Box, Image } from '@mantine/core'
import { type ReactNode } from 'react'
import { type CombatTile } from '~/data/mapTemplates/combat'
import useHexSize from './useHexSize'

type HexProps = {
	tile: CombatTile
	offset: [x: number, y: number]
	children?: ReactNode
}

export default function Hex({ tile: { cord, image }, offset, children }: HexProps) {
	const { left, top, width, height, clipPath } = useHexSize(cord, offset)

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
				style={{
					inset: 0,
					clipPath
				}}
			>
				<Image src={`/combatTiles/${image ?? 'grass'}.png`} />
			</Box>
			{children}
		</Box>
	)
}
