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
import { useConfirmTargetStore } from './Windows/ConfirmTargetWindow/useConfirmTargetStore'

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
	const cordString = `${cord[0]},${cord[1]},${cord[2]}` as const

	const { ref, isDropTarget } = useDroppable({
		id: `tile-${cordString}`,
		accept: 'character',
		data: {
			droppableType: 'TILE',
			cord
		} satisfies TileDroppable,
		disabled: !!tileData?.characterType
	})

	const isTargettingTiles = useConfirmTargetStore(state => state.target?.selectType === 'TILE')

	const selectedTiles = useConfirmTargetStore(state => state.selected?.tiles) ?? []
	const isSelected = selectedTiles.includes(cordString)

	const hexClickHandler = (_event: React.MouseEvent<HTMLDivElement>) => {
		if (!isTargettingTiles) return
		useConfirmTargetStore.getState().toggleTarget({ cord: cordString })
	}

	return (
		<HexContextMenu key={cordString} cord={cord}>
			<Hex
				ref={ref}
				tile={tile}
				offset={offset}
				onClick={hexClickHandler}
				hexProps={{
					onDragStart: (event: React.DragEvent<HTMLButtonElement>) => event.preventDefault(),
					style: {
						scale: isDropTarget || isSelected ? 0.9 : undefined,
						transition: 'scale 150ms ease-in-out',
						cursor: isTargettingTiles ? 'pointer' : 'default' // TODO change cursor of characterIcon too?
					}
				}}
			>
				{tileData && <CharacterIcon tabletopCharacterId={tileData.tabletopCharacterId} characterType={tileData.characterType} />}
			</Hex>
		</HexContextMenu>
	)
}
