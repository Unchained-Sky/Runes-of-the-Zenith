import { Box, type BoxComponentProps, Image, type PolymorphicComponentProps, Text } from '@mantine/core'
import { forwardRef, type ReactNode } from 'react'
import { type CombatTile } from '~/types/gameTypes/combatMap'
import useHexSize from './useHexSize'

type HexProps = {
	tile: CombatTile
	offset: [x: number, y: number]
	hexProps?: PolymorphicComponentProps<'div' | 'button', BoxComponentProps>
	children?: ReactNode
}

const Hex = forwardRef<HTMLDivElement, HexProps>(function Hex({ tile: { cord, image }, offset, hexProps, children }, ref) {
	const { left, top, width, height, clipPath } = useHexSize(cord, offset)

	const { style, ...props } = hexProps ?? {}

	return (
		<Box
			ref={ref}
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
				<Image src={`/combatTiles/${image}.png`} onMouseDown={e => e.preventDefault()} />
			</Box>
			<Text
				pos='absolute'
				top={96}
				left={4}
				c='white'
				style={{
					textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000'
				}}
			>{cord.toString()}
			</Text>
			{children}
		</Box>
	)
})

export default Hex
