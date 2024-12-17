// ! exhaustive-deps crashes eslint?
/* eslint react-hooks/exhaustive-deps: 0 */
import { Box } from '@mantine/core'
import { useMemo } from 'react'
import { type CombatTile } from '~/data/mapTemplates/combat'
import Hex from './Hex'
import { HEX_GAP, HEX_MULTIPLIER, HEX_SIZE, HEX_WIDTH_SCALER } from './constants'

type HoneycombProps = {
	tiles: CombatTile[]
}

export default function HoneycombGrid({ tiles }: HoneycombProps) {
	const cords = tiles.map(({ cord }) => cord)

	const xCords = cords.map(([q, r, _s]) => (2 * q) + r)
	const xHexAmount = ((Math.max(...xCords) - Math.min(...xCords)) / 2) + 1
	const minWidth = (xHexAmount * HEX_SIZE * HEX_MULTIPLIER) - HEX_GAP

	const yCords = cords.map(([_q, r, _s]) => r)

	const offset = useMemo<[number, number]>(() => [
		Math.min(...xCords),
		(Math.min(...yCords) * 2) + 1
	], [xCords, yCords])

	const minHeight = useMemo(() => {
		let multiplier = Math.max(...yCords) * 2
		multiplier -= offset[1] - 1
		multiplier *= HEX_WIDTH_SCALER
		multiplier *= HEX_MULTIPLIER
		multiplier *= (HEX_SIZE / 2)
		return multiplier + HEX_SIZE
	}, [yCords])

	return (
		<Box pos='relative' w={minWidth} h={minHeight}>
			{cords.map(cord => {
				return <Hex key={cord.toString()} cord={cord} offset={offset} />
			})}
		</Box>
	)
}
