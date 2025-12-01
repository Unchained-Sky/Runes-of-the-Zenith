import { useDroppable } from '@dnd-kit/react'
import { Box } from '@mantine/core'
import Hex from '~/components/HoneycombGrid/Hex'
import useHoneycombGridSize from '~/components/HoneycombGrid/useHoneycombGridSize'
import { type CombatTile } from '~/types/gameTypes/combatMap'
import { useTabletopMapTiles } from '../-hooks/tabletopData/useTabletopMapTiles'
import { type TabletopTile, useTabletopTiles } from '../-hooks/tabletopData/useTabletopTiles'
import CharacterIcon from './CharacterIcon'
import { type TileDroppable } from './DragDrop'
import HexContextMenu from './HexContextMenu'

export default function CombatGridTabletopGM() {
	const { data: mapTiles } = useTabletopMapTiles()
	const { data: tilesData } = useTabletopTiles()
	const { offset, minHeight, minWidth } = useHoneycombGridSize(mapTiles)

	return (
		<Box pos='relative' w={minWidth} h={minHeight} onContextMenu={e => e.preventDefault()}>
			{mapTiles.map(tile => {
				const tileData = tilesData[`${tile.cord[0]},${tile.cord[1]},${tile.cord[2]}`] ?? null
				return <Tile key={tile.cord.toString()} tile={tile} tileData={tileData} offset={offset} />
			})}
		</Box>
	)
}

type TileProps = {
	tile: CombatTile
	tileData: TabletopTile | null
	offset: [x: number, y: number]
}

function Tile({ tile, tileData, offset }: TileProps) {
	const { cord } = tile

	const { ref, isDropTarget } = useDroppable({
		id: `tile-${cord.toString()}`,
		accept: 'character',
		data: {
			droppableType: 'TILE',
			cord
		} satisfies TileDroppable,
		disabled: !!tileData?.characterType
	})

	return (
		<HexContextMenu key={cord.toString()} cord={cord}>
			<Hex
				ref={ref}
				tile={tile}
				offset={offset}
				hexProps={{
					onDragStart: (event: React.DragEvent<HTMLButtonElement>) => event.preventDefault(),
					style: {
						scale: isDropTarget ? '0.9' : undefined,
						transition: 'scale 150ms ease-in-out'
					}
				}}
			>
				{tileData && <CharacterIcon tileData={tileData} />}
			</Hex>
		</HexContextMenu>
	)
}
