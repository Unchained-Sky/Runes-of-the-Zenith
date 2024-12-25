import { useMemo } from 'react'
import { type CombatTileCord } from '~/data/mapTemplates/combat'
import { HEX_MULTIPLIER, HEX_SIZE, HEX_WIDTH_SCALER } from './constants'

export default function useHexSize(cord: CombatTileCord, offset: [x: number, y: number]) {
	const left = useMemo(() => {
		let multiplier = (2 * cord[0]) + cord[1]
		multiplier -= offset[0]
		multiplier *= HEX_MULTIPLIER
		return multiplier * (HEX_SIZE / 2)
	}, [cord, offset])

	const top = useMemo(() => {
		let multiplier = cord[1] * 2
		multiplier -= offset[1] - 1
		multiplier *= HEX_WIDTH_SCALER
		multiplier *= HEX_MULTIPLIER
		return multiplier * (HEX_SIZE / 2)
	}, [cord, offset])

	return {
		left,
		top,
		width: HEX_SIZE * HEX_WIDTH_SCALER,
		height: HEX_SIZE,
		clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'
	}
}
