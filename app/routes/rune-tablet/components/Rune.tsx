import { Box, type BoxProps } from '@mantine/core'
import { type ForwardedRef, forwardRef } from 'react'
import { getRune, type RuneName } from '~/data/runes'
import { RUNE_SQUARE_SIZE } from '~/RT/data/constants'

export type RuneProps = {
	runeName: RuneName
	scale?: number
}

export default forwardRef(function Rune({ runeName, scale = 1, ...props }: RuneProps & BoxProps, ref: ForwardedRef<HTMLDivElement>) {
	const { shape, colour } = getRune(runeName)

	const squareSize = RUNE_SQUARE_SIZE * scale

	return (
		<Box
			ref={ref}
			h={`${shape.length * squareSize}px`}
			w={`${shape[0].length * squareSize}px`}
			pos='relative'
			{...props}
		>
			{
				shape.map((row, rowIndex) => {
					return row.map((square, columnIndex) => {
						if (square === ' ') return null
						return (
							<RuneSquare
								key={`${rowIndex}-${columnIndex}`}
								colour={colour}
								x={rowIndex}
								y={columnIndex}
								size={squareSize}
							/>
						)
					})
				})
			}
		</Box>
	)
})

type RuneSquareProps = {
	colour: string
	x: number
	y: number
	size: number
}

function RuneSquare({ colour, x, y, size }: RuneSquareProps) {
	return (
		<Box
			bg={colour}
			h={`${size}px`}
			w={`${size}px`}
			bd='black 1px solid'
			pos='absolute'
			left={`${size * y}px`}
			top={`${size * x}px`}
		/>
	)
}
