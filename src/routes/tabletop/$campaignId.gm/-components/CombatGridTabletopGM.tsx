import { useDraggable, useDroppable } from '@dnd-kit/react'
import { Avatar, type AvatarProps, Box } from '@mantine/core'
import Hex from '~/components/HoneycombGrid/Hex'
import useHoneycombGridSize from '~/components/HoneycombGrid/useHoneycombGridSize'
import { type CombatTile } from '~/types/gameTypes/combatMap'
import { useTabletopEnemies } from '../-hooks/tabletopData/useTabletopEnemies'
import { useTabletopHeroes } from '../-hooks/tabletopData/useTabletopHeroes'
import { useTabletopMapTiles } from '../-hooks/tabletopData/useTabletopMapTiles'
import { type TabletopTile, useTabletopTiles } from '../-hooks/tabletopData/useTabletopTiles'
import { type CharacterDraggable, type TileDroppable } from './DragDrop'
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

const avatarSettings = {
	pos: 'absolute',
	left: '40%',
	top: '40%',
	style: {
		cursor: 'grab'
	}
} satisfies AvatarProps

type CharacterIconProps = {
	tileData: TabletopTile
}

function CharacterIcon({ tileData }: CharacterIconProps) {
	const { data: heroesData } = useTabletopHeroes()
	const { data: enemiesData } = useTabletopEnemies()

	const { ref } = useDraggable({
		id: `character-${tileData.tabletopCharacterId}`,
		type: 'character',
		data: {
			draggableType: 'CHARACTER',
			tabletopCharacterId: tileData.tabletopCharacterId,
			characterType: tileData.characterType
		} satisfies CharacterDraggable
	})

	const getName = () => {
		switch (tileData.characterType) {
			case 'HERO':
				return heroesData.getFromCharacterId(tileData.tabletopCharacterId)?.heroName ?? ''
			case 'ENEMY':
				return enemiesData[tileData.tabletopCharacterId]?.tabletopEnemy.enemyInfo.enemyName ?? ''
		}
	}

	return (
		<Avatar
			ref={ref}
			name={getName()}
			color={tileData.characterType === 'HERO' ? 'green' : 'red'}
			{...avatarSettings}
		/>
	)
}
