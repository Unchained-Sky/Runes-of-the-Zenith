import { Box, Menu } from '@mantine/core'
import ContextMenu from '~/components/ContextMenu'
import Hex from '~/components/HoneycombGrid/Hex'
import useHoneycombGridSize from '~/components/HoneycombGrid/useHoneycombGridSize'
import { type CombatTile } from '~/data/mapTemplates/combat'

type CombatGridPreview = {
	tiles: CombatTile[]
}

export default function CombatGridTabletopGM({ tiles }: CombatGridPreview) {
	const { offset, minHeight, minWidth } = useHoneycombGridSize(tiles)

	return (
		<Box pos='relative' w={minWidth} h={minHeight} onContextMenu={e => e.preventDefault()}>
			{tiles.map(tile => {
				const { cord } = tile
				return (
					<ContextMenu
						key={cord.toString()}
						menuItems={(
							<>
								<Menu.Label>Characters</Menu.Label>
								<Menu.Item>Add Player</Menu.Item>
								<Menu.Item>Add Enemy</Menu.Item>
							</>
						)}
					>
						<Hex
							tile={tile}
							offset={offset}
						/>
					</ContextMenu>
				)
			})}
		</Box>
	)
}
