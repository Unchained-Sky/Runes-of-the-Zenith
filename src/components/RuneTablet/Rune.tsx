/* eslint-disable @typescript-eslint/restrict-template-expressions */

import { Box } from '@mantine/core'

const SQUARE_SIZE = 48

type RuneProps = {
	colour: string
	shape: (' ' | 'X')[][]
}

export default function Rune({ colour, shape }: RuneProps) {
	return (
		<Box
			h={`${shape.length * SQUARE_SIZE}px`}
			w={`${shape[0].length * SQUARE_SIZE}px`}
			style={{ position: 'relative' }}
		>
			{
				shape.map((row, rowIndex) => {
					return row.map((square, squareIndex) => {
						if (square === ' ') return null
						return (
							<Square
								key={`${rowIndex}-${squareIndex}`}
								colour={colour}
								left={squareIndex}
								top={rowIndex}
							/>
						)
					})
				})
			}
		</Box>
	)
}

type SquareProps = {
	colour: string
	left: number
	top: number
}

function Square({ colour, left, top }: SquareProps) {
	return (
		<Box
			bg={colour}
			h={`${SQUARE_SIZE}px`}
			w={`${SQUARE_SIZE}px`}
			bd='black 1px solid'
			style={{
				position: 'absolute',
				left: `${SQUARE_SIZE * left}px`,
				top: `${SQUARE_SIZE * top}px`
			}}
		/>
	)
}
