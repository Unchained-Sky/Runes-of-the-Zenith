import { Box } from '@mantine/core'
import Hex from './Hex'
import { HEX_GAP, HEX_SIZE, HEX_WIDTH_SCALER } from './constants'

export type HexCord = [q: number, r: number, s: number]

export default function Honeycomb() {
	const cords: HexCord[] = [
		[0, -1, 1],
		[1, -1, 0],

		[-1, 0, 1],
		[0, 0, 0],
		[1, 0, -1],

		[-1, 1, 0],
		[0, 1, -1],

		[-2, 0, 2],
		[-3, 1, 2],
		[-3, 0, 3],
		[-1, 2, -1]
	]

	const xCords = cords.map(([q, r, _s]) => (2 * q) + r)
	const xHexAmount = ((Math.min(...xCords) * -1) / 2) + Math.max(...xCords)
	const minWidth = (xHexAmount * HEX_SIZE) - HEX_GAP

	const yCords = cords.map(([_q, r, _s]) => r)
	const yHexAmount = (Math.min(...yCords) * -1) + Math.max(...yCords) + 1
	const minHeight = (yHexAmount * HEX_SIZE * HEX_WIDTH_SCALER) + HEX_GAP

	const offset: [number, number] = [Math.min(...xCords), Math.min(...yCords)]

	return (
		<Box pos='relative' w={minWidth} h={minHeight}>
			{cords.map(cord => {
				return <Hex key={cord.toString()} cord={cord} offset={offset} />
			})}
		</Box>
	)
}
