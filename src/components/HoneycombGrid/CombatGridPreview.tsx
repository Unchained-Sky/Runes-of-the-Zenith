import { Box } from '@mantine/core'
import { type CombatTile } from '~/types/gameTypes/combatMap'
import Hex from './Hex'
import useHoneycombGridSize from './useHoneycombGridSize'

type CombatGridPreview = {
	tiles: CombatTile[]
}

export default function CombatGridPreview({ tiles }: CombatGridPreview) {
	const { offset, minHeight, minWidth } = useHoneycombGridSize(tiles)

	return (
		<Box pos='relative' w={minWidth} h={minHeight}>
			{tiles.map(tile => {
				const { cord } = tile
				return <Hex key={cord.toString()} tile={tile} offset={offset} />
			})}
		</Box>
	)
}
