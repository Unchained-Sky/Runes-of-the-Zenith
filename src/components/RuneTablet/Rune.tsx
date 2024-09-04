import { Box, type BoxProps } from '@mantine/core'
import { type ForwardedRef, forwardRef } from 'react'
import { RUNE_SQUARE_SIZE } from '~/data/constants'
import { getRune, type RuneName } from '~/data/runes'

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
								left={columnIndex}
								top={rowIndex}
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
	left: number
	top: number
	size: number
}

function RuneSquare({ colour, left, top, size }: RuneSquareProps) {
	return (
		<Box
			bg={colour}
			h={`${size}px`}
			w={`${size}px`}
			bd='black 1px solid'
			pos='absolute'
			left={`${size * left}px`}
			top={`${size * top}px`}
		/>
	)
}
