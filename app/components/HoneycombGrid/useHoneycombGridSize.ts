import { useMemo } from 'react'
import { type CombatTile } from '~/data/mapTemplates/combat'
import { HEX_GAP, HEX_MULTIPLIER, HEX_SIZE, HEX_WIDTH_SCALER } from './constants'

type UseHoneycombGridSizeOptions = Partial<{
	padding: number
}>

export default function useHoneycombGridSize(tiles: CombatTile[], options: UseHoneycombGridSizeOptions = {}) {
	const { padding = 0 } = options

	const cords = tiles.map(({ cord }) => cord)
	const xCords = cords.map(([q, r, _s]) => (2 * q) + r)
	const yCords = cords.map(([_q, r, _s]) => r)

	const offset = useMemo<[number, number]>(() => [
		Math.min(...xCords) - ((padding / (HEX_SIZE * HEX_MULTIPLIER)) * 2),
		(Math.min(...yCords) * 2) + 1 - ((padding * 2) / (HEX_SIZE * HEX_MULTIPLIER * HEX_WIDTH_SCALER))
	], [xCords, yCords])

	const minWidth = useMemo(() => {
		let multiplier = ((Math.max(...xCords) - Math.min(...xCords)) / 2) + 1
		multiplier *= HEX_SIZE
		multiplier *= HEX_MULTIPLIER
		multiplier -= HEX_GAP
		multiplier += (padding * 2)
		return multiplier
	}, [xCords])

	const minHeight = useMemo(() => {
		let multiplier = Math.max(...yCords) * 2
		multiplier -= offset[1] - 1
		multiplier *= HEX_WIDTH_SCALER
		multiplier *= HEX_MULTIPLIER
		multiplier *= (HEX_SIZE / 2)
		multiplier += HEX_SIZE
		multiplier += padding
		return multiplier
	}, [yCords])

	return {
		cords,
		offset,
		minWidth,
		minHeight
	}
}
