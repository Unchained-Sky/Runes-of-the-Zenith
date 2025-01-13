import { Box, type BoxComponentProps, Image, type PolymorphicComponentProps } from '@mantine/core'
import { type ReactNode } from 'react'
import { type CombatTile } from '~/data/mapTemplates/combat'
import useHexSize from './useHexSize'

type HexProps = {
	tile: CombatTile
	offset: [x: number, y: number]
	hexProps?: PolymorphicComponentProps<'div' | 'button', BoxComponentProps>
	children?: ReactNode
}

export default function Hex({ tile: { cord, image }, offset, hexProps, children }: HexProps) {
	const { left, top, width, height, clipPath } = useHexSize(cord, offset)

	const { style, ...props } = hexProps ?? {}

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
				style={[
					{
						inset: 0,
						clipPath
					},
					style
				]}
				{...props}
			>
				<Image src={`/combatTiles/${image}.png`} />
			</Box>
			{children}
		</Box>
	)
}
