import { Avatar, Box } from '@mantine/core'
import { type DragEventHandler } from 'react'
import Hex from '~/components/HoneycombGrid/Hex'
import useHoneycombGridSize from '~/components/HoneycombGrid/useHoneycombGridSize'
import { useTabletopTiles } from '../-hooks/-useTabletopData'
import HexContextMenu from './HexContextMenu'

export default function CombatGridTabletopGM() {
	const { data: tiles } = useTabletopTiles()

	const { offset, minHeight, minWidth } = useHoneycombGridSize(tiles)

	return (
		<Box pos='relative' w={minWidth} h={minHeight} onContextMenu={e => e.preventDefault()}>
			{tiles.map(tile => {
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
							<Avatar />
						</Hex>
					</HexContextMenu>
				)
			})}
		</Box>
	)
}
