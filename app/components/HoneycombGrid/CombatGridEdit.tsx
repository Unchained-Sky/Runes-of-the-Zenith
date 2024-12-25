import { Box, useMantineTheme } from '@mantine/core'
import { type CombatTile, type CombatTileCord } from '~/data/mapTemplates/combat'
import useHexSize from './useHexSize'
import useHoneycombGridSize from './useHoneycombGridSize'

type CombatGridEdit = {
	tiles: CombatTile[]
}

export default function CombatGridEdit({ tiles }: CombatGridEdit) {
	const { cords, offset, minHeight, minWidth } = useHoneycombGridSize(tiles, { padding: 40 })

	return (
		<Box pos='relative' w={minWidth} h={minHeight}>
			{cords.map(cord => {
				return <Hex key={cord.toString()} cord={cord} offset={offset} />
			})}
		</Box>
	)
}

type HexProps = {
	cord: CombatTileCord
	offset: [x: number, y: number]
}

function Hex({ cord, offset }: HexProps) {
	const { left, top, width, height, clipPath } = useHexSize(cord, offset)

	const theme = useMantineTheme()

	return (
		<Box
			pos='absolute'
			bg={theme.primaryColor}
			w={width}
			h={height}
			left={left}
			top={top}
			style={{
				clipPath
			}}
		/>
	)
}
