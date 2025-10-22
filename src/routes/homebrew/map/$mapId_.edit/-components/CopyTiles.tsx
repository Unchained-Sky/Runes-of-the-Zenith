import { UnstyledButton } from '@mantine/core'
import { Fragment, useMemo } from 'react'
import { COPY_TILE_WIDTH, HEX_GAP, HEX_SIZE, HEX_WIDTH_SCALER } from '~/components/HoneycombGrid/constants'
import { type CombatTile } from '~/types/gameTypes/combatMap'
import { useMapEditStore } from '../-hooks/useMapEditStore'

type CopyTilesProps = {
	tile: CombatTile
}

export default function CopyTiles({ tile }: CopyTilesProps) {
	const tiles = useMapEditStore(state => state.tiles)

	const adjacentTiles = useMemo(() => {
		const adjacentTile = (q: number, r: number, s: number) => {
			const isBlocked = !Object.hasOwn(tiles, `${tile.cord[0] + q},${tile.cord[1] + r},${tile.cord[2] + s}`)
			return isBlocked
				? {
					cord: [tile.cord[0] + q, tile.cord[1] + r, tile.cord[2] + s],
					image: tile.image,
					terrainType: tile.terrainType
				} satisfies CombatTile
				: null
		}
		return {
			left: adjacentTile(-1, 0, 1),
			topLeft: adjacentTile(0, -1, 1),
			topRight: adjacentTile(1, -1, 0),
			right: adjacentTile(1, 0, -1),
			bottomRight: adjacentTile(0, 1, -1),
			bottomLeft: adjacentTile(-1, 1, 0)
		}
	}, [tile, tiles])

	return (
		<Fragment>
			<CopyTile left={(COPY_TILE_WIDTH * -1) - HEX_GAP} top={HEX_SIZE / 4} rotation={0} adjacentTile={adjacentTiles.left} />
			<CopyTile left={17} top={-34} rotation={60} adjacentTile={adjacentTiles.topLeft} />
			<CopyTile left={102} top={-34} rotation={120} adjacentTile={adjacentTiles.topRight} />
			<CopyTile left={(HEX_SIZE * HEX_WIDTH_SCALER) + HEX_GAP} top={HEX_SIZE / 4} rotation={0} adjacentTile={adjacentTiles.right} />
			<CopyTile left={102} top={113} rotation={240} adjacentTile={adjacentTiles.bottomRight} />
			<CopyTile left={17} top={113} rotation={300} adjacentTile={adjacentTiles.bottomLeft} />
		</Fragment>
	)
}

type CopyTileProps = {
	left: number
	top: number
	rotation: number
	adjacentTile: CombatTile | null
}

function CopyTile({ left, top, rotation, adjacentTile }: CopyTileProps) {
	const addTiles = useMapEditStore(state => state.addTiles)

	return adjacentTile && (
		<UnstyledButton
			pos='absolute'
			bg='red'
			w={COPY_TILE_WIDTH}
			h={HEX_SIZE / 2}
			ml={left}
			mt={top}
			style={{
				rotate: `${rotation}deg`
			}}
			onClick={() => addTiles([adjacentTile])}
		/>
	)
}
