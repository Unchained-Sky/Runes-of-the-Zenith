import { Box, Text } from '@mantine/core'
import Hex from '~/components/HoneycombGrid/Hex'
import useHoneycombGridSize from '~/components/HoneycombGrid/useHoneycombGridSize'
import { type CombatTile } from '~/types/gameTypes/combatMap'
import { usePlayerTabletopMapTiles } from '../../-hooks/tabletopData/useTabletopMapTiles'
import { type TabletopTile, usePlayerTabletopTiles } from '../../-hooks/tabletopData/useTabletopTiles'
import CharacterIcon from './CharacterIcon'

export default function CombatGridTabletopPlayer() {
	const { data: mapTiles } = usePlayerTabletopMapTiles()
	const { data: tilesData } = usePlayerTabletopTiles()
	const { offset, minHeight, minWidth } = useHoneycombGridSize(mapTiles)

	// TODO add to GM view
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
	return (
		<Hex
			tile={tile}
			offset={offset}
			hexProps={{
				onDragStart: (event: React.DragEvent<HTMLButtonElement>) => event.preventDefault()
			}}
		>
			{tileData && <CharacterIcon tabletopCharacterId={tileData.tabletopCharacterId} characterType={tileData.characterType} />}
		</Hex>
	)
}
