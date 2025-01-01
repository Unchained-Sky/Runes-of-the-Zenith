import { Box } from '@mantine/core'
import { useMapEditStore } from 'app/routes/homebrew.map.$id.edit._index/useMapEditStore'
import { useCallback } from 'react'
import { type CombatTileCord } from '~/data/mapTemplates/combat'
import { COPY_TILE_WIDTH, HEX_GAP, HEX_SIZE, HEX_WIDTH_SCALER } from './constants'
import Hex from './Hex'
import classes from './Hex.module.css'
import useHoneycombGridSize from './useHoneycombGridSize'

export default function CombatGridEdit() {
	const tiles = useMapEditStore(state => state.tiles)
	const tileValues = Object.values(tiles)

	const { offset, minHeight, minWidth } = useHoneycombGridSize(tileValues, { padding: COPY_TILE_WIDTH + HEX_GAP })

	const isBlocked = useCallback((cord: CombatTileCord, q: number, r: number, s: number) => {
		return !Object.hasOwn(tiles, `${cord[0] + q},${cord[1] + r},${cord[2] + s}`)
	}, [tiles])

	return (
		<Box pos='relative' w={minWidth} h={minHeight}>
			{tileValues.map(tile => {
				const left = isBlocked(tile.cord, -1, 0, 1)
				const topLeft = isBlocked(tile.cord, 0, -1, 1)
				const topRight = isBlocked(tile.cord, 1, -1, 0)
				const right = isBlocked(tile.cord, 1, 0, -1)
				const bottomRight = isBlocked(tile.cord, 0, 1, -1)
				const bottomLeft = isBlocked(tile.cord, -1, 1, 0)

				return (
					<Hex
						key={tile.cord.toString()}
						tile={tile}
						offset={offset}
						hexProps={{
							className: classes.editHex,
							component: 'button'
						}}
					>
						{left && <CopyTile left={(COPY_TILE_WIDTH * -1) - HEX_GAP} top={HEX_SIZE / 4} rotation={0} />}
						{topLeft && <CopyTile left={17} top={-34} rotation={60} />}
						{topRight && <CopyTile left={102} top={-34} rotation={120} />}
						{right && <CopyTile left={(HEX_SIZE * HEX_WIDTH_SCALER) + HEX_GAP} top={HEX_SIZE / 4} rotation={0} />}
						{bottomRight && <CopyTile left={102} top={113} rotation={240} />}
						{bottomLeft && <CopyTile left={17} top={113} rotation={300} />}
					</Hex>
				)
			})}
		</Box>
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
