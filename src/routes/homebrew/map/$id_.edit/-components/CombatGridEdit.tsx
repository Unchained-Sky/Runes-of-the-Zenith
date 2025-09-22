import { Box } from '@mantine/core'
import { useMemo } from 'react'
import { COPY_TILE_WIDTH, HEX_GAP } from '~/components/HoneycombGrid/constants'
import Hex from '~/components/HoneycombGrid/Hex'
import classes from '~/components/HoneycombGrid/Hex.module.css'
import useHoneycombGridSize from '~/components/HoneycombGrid/useHoneycombGridSize'
import { useMapEditStore } from '../-hooks/useMapEditStore'
import CopyTiles from './CopyTiles'

export default function CombatGridEdit() {
	const tiles = useMapEditStore(state => state.tiles)
	const tileValues = useMemo(() => Object.values(tiles), [tiles])

	const { offset, minHeight, minWidth } = useHoneycombGridSize(tileValues, { padding: COPY_TILE_WIDTH + HEX_GAP })

	const selectTile = useMapEditStore(state => state.selectTile)
	const selectedTiles = useMapEditStore(state => state.selectedTiles)

	return (
		<Box pos='relative' w={minWidth} h={minHeight}>
			{tileValues.map(tile => {
				const cords = `${tile.cord[0]},${tile.cord[1]},${tile.cord[2]}` as const
				return (
					<Hex
						key={tile.cord.toString()}
						tile={tile}
						offset={offset}
						hexProps={{
							className: classes.editHex,
							component: 'button',
							onClick: () => selectTile(cords),
							style: {
								scale: selectedTiles.includes(cords) ? '0.9' : undefined
							}
						}}
					>
						<CopyTiles tile={tile} />
					</Hex>
				)
			})}
		</Box>
	)
}
