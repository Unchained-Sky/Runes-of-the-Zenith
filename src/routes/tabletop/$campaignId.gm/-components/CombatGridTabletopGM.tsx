import { Avatar, Box } from '@mantine/core'
import { type DragEventHandler } from 'react'
import Hex from '~/components/HoneycombGrid/Hex'
import useHoneycombGridSize from '~/components/HoneycombGrid/useHoneycombGridSize'
import { type CombatTileCord } from '~/types/gameTypes/combatMap'
import { useTabletopEnemies, useTabletopHeroes, useTabletopMapTiles, useTabletopTiles } from '../-hooks/useTabletopData'
import HexContextMenu from './HexContextMenu'

export default function CombatGridTabletopGM() {
	const { data: mapTiles } = useTabletopMapTiles()
	const { offset, minHeight, minWidth } = useHoneycombGridSize(mapTiles)

	return (
		<Box pos='relative' w={minWidth} h={minHeight} onContextMenu={e => e.preventDefault()}>
			{mapTiles.map(tile => {
				const { cord } = tile
				return (
					<HexContextMenu key={cord.toString()} cord={cord}>
						<Hex
							tile={tile}
							offset={offset}
							hexProps={{
								onDragStart: (e: Parameters<DragEventHandler<HTMLButtonElement>>[0]) => e.preventDefault()
							}}
						>
							<CharacterIcon cord={cord} />
						</Hex>
					</HexContextMenu>
				)
			})}
		</Box>
	)
}

type CharacterIconProps = {
	cord: CombatTileCord
}

function CharacterIcon({ cord }: CharacterIconProps) {
	const { data: tiles } = useTabletopTiles()
	const { data: heroesData } = useTabletopHeroes()
	const { data: enemiesData } = useTabletopEnemies()

	const tileData = tiles[`${cord[0]},${cord[1]},${cord[2]}`]
	if (!tileData) return null

	switch (tileData.characterType) {
		case 'HERO': {
			const heroData = Object.values(heroesData).find(hero => hero.tabletopHero?.characterId === tileData.characterId)
			if (heroData) {
				return <Avatar name={heroData.heroName} color='green' pos='absolute' left='40%' top='40%' />
			}
			break
		}
		case 'ENEMY': {
			const enemyData = Object.values(enemiesData).find(enemy => enemy.tabletopCharacter === tileData.characterId)
			if (enemyData) {
				return <Avatar name={enemyData.data.tabletopEnemy?.enemyInfo.enemyName} color='red' pos='absolute' left='40%' top='40%' />
			}
			break
		}
	}
}
