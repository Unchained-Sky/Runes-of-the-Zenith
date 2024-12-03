import { Box } from '@mantine/core'
import { type CombatTile } from '~/data/mapTemplates/combat'
import Hex from './Hex'
import { HEX_GAP, HEX_SIZE, HEX_WIDTH_SCALER } from './constants'

type HoneycombProps = {
	tiles: CombatTile[]
}

export default function HoneycombGrid({ tiles }: HoneycombProps) {
	const cords = tiles.map(({ cord }) => cord)

	const xCords = cords.map(([q, r, _s]) => (2 * q) + r)
	const xHexAmount = ((Math.max(...xCords) - Math.min(...xCords)) / 2) + 1
	const minWidth = (xHexAmount * HEX_SIZE) - HEX_GAP

	const yCords = cords.map(([_q, r, _s]) => r)
	const yHexAmount = (Math.min(...yCords) * -1) + Math.max(...yCords) + 1
	const minHeight = (yHexAmount * HEX_SIZE * HEX_WIDTH_SCALER) + HEX_GAP

	const offset: [number, number] = [
		Math.min(...xCords),
		(Math.min(...yCords) * 2) + 1
	]

	return (
		<Box pos='relative' w={minWidth} h={minHeight}>
			{cords.map(cord => {
				return <Hex key={cord.toString()} cord={cord} offset={offset} />
			})}
		</Box>
	)
}
