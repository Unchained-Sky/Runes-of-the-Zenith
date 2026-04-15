import { useDroppable } from '@dnd-kit/react'
import { Box, Text } from '@mantine/core'
import Hex from '~/components/HoneycombGrid/Hex'
import useHoneycombGridSize from '~/components/HoneycombGrid/useHoneycombGridSize'
import CharacterIcon from '~/tt/-components/CharacterIcon'
import { type TileDroppable } from '~/tt/-components/DragDrop'
import { useTabletopMapTiles } from '~/tt/-hooks/tabletopData/useTabletopMapTiles'
import { type TabletopTile, useTabletopTiles } from '~/tt/-hooks/tabletopData/useTabletopTiles'
import { useConfirmTargetStore } from '~/tt/-windows/ConfirmTargetWindow/useConfirmTargetStore'
import { type CombatTile } from '~/types/gameTypes/combatMap'

export default function CombatGridTabletopPlayer() {
	const { data: mapTiles } = useTabletopMapTiles()
	const { data: tilesData } = useTabletopTiles()
	const { offset, minHeight, minWidth } = useHoneycombGridSize(mapTiles)

	if (!mapTiles.length) return <NoEncounter />

	return (
		<Box pos='relative' w={minWidth} h={minHeight} onContextMenu={e => e.preventDefault()}>
			{mapTiles.map(tile => {
				const tileData = tilesData[`${tile.cord[0]},${tile.cord[1]},${tile.cord[2]}`] ?? null
				return <Tile key={tile.cord.toString()} tile={tile} tileData={tileData} offset={offset} />
			})}
		</Box>
	)
}

function NoEncounter() {
	return <Text>No Encounter Loaded</Text>
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
	)
}
