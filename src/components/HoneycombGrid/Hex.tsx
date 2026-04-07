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

const Hex = forwardRef<HTMLDivElement, HexProps & PolymorphicComponentProps<'div', BoxComponentProps>>(function Hex({ tile: { cord, image }, offset, hexProps, children, ...parentProps }, ref) {
	const { left, top, width, height, clipPath } = useHexSize(cord, offset)

	const { style, ...props } = hexProps ?? {}

	const hasScale = !!(style && 'scale' in style && style.scale)

	return (
		<Box
			ref={ref}
			pos='absolute'
			w={width}
			h={height}
			left={left}
			top={top}
			{...parentProps}
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
				pos='relative'
				top={132}
				left={-2}
				c='white'
				style={{
					textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000',
					rotate: '30deg',
					transition: '150ms ease-in-out',
					translate: hasScale ? '5px -6px' : 0 // TODO calculate this off of scale
				}}
			>
				{cord.toString()}
			</Text>
			{children}
		</Box>
	)
})

export default Hex
