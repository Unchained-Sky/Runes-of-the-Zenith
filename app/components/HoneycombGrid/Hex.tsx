// ! exhaustive-deps crashes eslint?
/* eslint react-hooks/exhaustive-deps: 0 */
import { Box, useMantineTheme } from '@mantine/core'
import { useMemo, type ReactNode } from 'react'
import { type CombatTileCord } from '~/data/mapTemplates/combat'
import { HEX_MULTIPLIER, HEX_SIZE, HEX_WIDTH_SCALER } from './constants'

type HexProps = {
	cord: CombatTileCord
	offset: [x: number, y: number]
	children?: ReactNode
}

export default function Hex({ cord: [q, r, _s], offset: [x, y], children }: HexProps) {
	const left = useMemo(() => {
		let multiplier = (2 * q) + r
		multiplier -= x
		multiplier *= HEX_MULTIPLIER
		return multiplier * (HEX_SIZE / 2)
	}, [q, r, x])

	const top = useMemo(() => {
		let multiplier = r * 2
		multiplier -= y - 1
		multiplier *= HEX_WIDTH_SCALER
		multiplier *= HEX_MULTIPLIER
		return multiplier * (HEX_SIZE / 2)
	}, [r, y])

	const theme = useMantineTheme()

	return (
		<Box
			pos='absolute'
			bg={theme.primaryColor}
			w={HEX_SIZE * HEX_WIDTH_SCALER}
			h={HEX_SIZE}
			left={left}
			top={top}
			style={{
				clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'
			}}
		>
			{children}
		</Box>
	)
}
