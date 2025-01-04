import { Box } from '@mantine/core'
import { useMapEditStore } from 'app/routes/homebrew.map.$id.edit._index/useMapEditStore'
import { useCallback, useMemo } from 'react'
import { type CombatTile, type CombatTileCord } from '~/data/mapTemplates/combat'
import { COPY_TILE_WIDTH, HEX_GAP, HEX_SIZE, HEX_WIDTH_SCALER } from '../constants'

type CopyTilesProps = {
	tile: CombatTile
}

export default function CopyTiles({ tile }: CopyTilesProps) {
	const tiles = useMapEditStore(state => state.tiles)
	const isBlocked = useCallback((cord: CombatTileCord, q: number, r: number, s: number) => {
		return !Object.hasOwn(tiles, `${cord[0] + q},${cord[1] + r},${cord[2] + s}`)
	}, [tiles])

	const blocked = useMemo(() => {
		return {
			left: isBlocked(tile.cord, -1, 0, 1),
			topLeft: isBlocked(tile.cord, 0, -1, 1),
			topRight: isBlocked(tile.cord, 1, -1, 0),
			right: isBlocked(tile.cord, 1, 0, -1),
			bottomRight: isBlocked(tile.cord, 0, 1, -1),
			bottomLeft: isBlocked(tile.cord, -1, 1, 0)
		}
	}, [tile, isBlocked])

	return (
		<>
			{blocked.left && <CopyTile left={(COPY_TILE_WIDTH * -1) - HEX_GAP} top={HEX_SIZE / 4} rotation={0} />}
			{blocked.topLeft && <CopyTile left={17} top={-34} rotation={60} />}
			{blocked.topRight && <CopyTile left={102} top={-34} rotation={120} />}
			{blocked.right && <CopyTile left={(HEX_SIZE * HEX_WIDTH_SCALER) + HEX_GAP} top={HEX_SIZE / 4} rotation={0} />}
			{blocked.bottomRight && <CopyTile left={102} top={113} rotation={240} />}
			{blocked.bottomLeft && <CopyTile left={17} top={113} rotation={300} />}
		</>
	)
}

type CopyTileProps = {
	left: number
	top: number
	rotation: number
}

function CopyTile({ left, top, rotation }: CopyTileProps) {
	return (
		<Box
			pos='absolute'
			bg='red'
			w={COPY_TILE_WIDTH}
			h={HEX_SIZE / 2}
			ml={left}
			mt={top}
			style={{
				rotate: `${rotation}deg`
			}}
		/>
	)
}
