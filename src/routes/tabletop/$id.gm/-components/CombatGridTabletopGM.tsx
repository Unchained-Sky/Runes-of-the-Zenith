import { Box, Menu } from '@mantine/core'
import { Fragment, type DragEventHandler } from 'react'
import ContextMenu from '~/components/ContextMenu'
import Hex from '~/components/HoneycombGrid/Hex'
import useHoneycombGridSize from '~/components/HoneycombGrid/useHoneycombGridSize'
import { type CombatTile } from '~/data/mapTemplates/combat'
import { useTabletopTiles } from '../-hooks/-useTabletopData'

export default function CombatGridTabletopGM() {
	const { data: tiles } = useTabletopTiles()

	const { offset, minHeight, minWidth } = useHoneycombGridSize(tiles)

	return (
		<Box pos='relative' w={minWidth} h={minHeight} onContextMenu={e => e.preventDefault()}>
			{tiles.map(tile => {
				const { cord } = tile
				return <CustomHex key={cord.toString()} tile={tile} offset={offset} />
			})}
		</Box>
	)
}

type CustomHexProps = {
	tile: CombatTile
	offset: [number, number]
}

function CustomHex({ tile, offset }: CustomHexProps) {
	return (
		<ContextMenu
			menuItems={(
				<Fragment>
					<Menu.Label>Characters</Menu.Label>
					<Menu.Item>Add Character</Menu.Item>
					<Menu.Item>Add Enemy</Menu.Item>
				</Fragment>
			)}
		>
			<Hex
				tile={tile}
				offset={offset}
				hexProps={{
					onDragStart: (e: Parameters<DragEventHandler<HTMLButtonElement>>[0]) => e.preventDefault()
				}}
			/>
		</ContextMenu>
	)
}
