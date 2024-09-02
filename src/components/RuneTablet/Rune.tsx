import { Box, type BoxProps } from '@mantine/core'
import { type ForwardedRef, forwardRef } from 'react'
import { RUNE_SQUARE_SIZE } from '~/data/constants'
import { type RuneData } from '~/data/runes'

export type RuneProps = {
	runeData: RuneData
}

export default forwardRef(function Rune({ runeData: { colour, shape }, ...props }: RuneProps & BoxProps, ref: ForwardedRef<HTMLDivElement>) {
	return (
		<Box
			ref={ref}
			h={`${shape.length * RUNE_SQUARE_SIZE}px`}
			w={`${shape[0].length * RUNE_SQUARE_SIZE}px`}
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
}

function RuneSquare({ colour, left, top }: RuneSquareProps) {
	return (
		<Box
			bg={colour}
			h={`${RUNE_SQUARE_SIZE}px`}
			w={`${RUNE_SQUARE_SIZE}px`}
			bd='black 1px solid'
			pos='absolute'
			left={`${RUNE_SQUARE_SIZE * left}px`}
			top={`${RUNE_SQUARE_SIZE * top}px`}
		/>
	)
}
