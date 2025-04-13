import { Box, Menu } from '@mantine/core'
import { useLoaderData } from '@remix-run/react'
import { type DragEventHandler } from 'react'
import ContextMenu from '~/components/ContextMenu'
import Hex from '~/components/HoneycombGrid/Hex'
import useHoneycombGridSize from '~/components/HoneycombGrid/useHoneycombGridSize'
import { type TabletopGMLoader } from '..'

export default function CombatGridTabletopGM() {
	const { tiles } = useLoaderData<TabletopGMLoader>()

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
								<Menu.Item>Add Character</Menu.Item>
								<Menu.Item>Add Enemy</Menu.Item>
							</>
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
			})}
		</Box>
	)
}
