import { DndContext, useDroppable } from '@dnd-kit/core'
import { restrictToWindowEdges } from '@dnd-kit/modifiers'
import { Box, Menu } from '@mantine/core'
import { useLoaderData } from '@remix-run/react'
import { type DragEventHandler } from 'react'
import ContextMenu from '~/components/ContextMenu'
import Hex from '~/components/HoneycombGrid/Hex'
import useHoneycombGridSize from '~/components/HoneycombGrid/useHoneycombGridSize'
import { type CombatTile } from '~/data/mapTemplates/combat'
import { type TabletopGMLoader } from '..'

export default function CombatGridTabletopGM() {
	const { tiles } = useLoaderData<TabletopGMLoader>()

	const { offset, minHeight, minWidth } = useHoneycombGridSize(tiles)

	return (
		<Box pos='relative' w={minWidth} h={minHeight} onContextMenu={e => e.preventDefault()}>
			<DndContext modifiers={[restrictToWindowEdges]}>
				{tiles.map(tile => {
					const { cord } = tile
					return <CustomHex key={cord.toString()} tile={tile} offset={offset} />
				})}

				{/* <DragOverlay style={{ cursor: 'grabbing' }} /> */}
			</DndContext>
		</Box>
	)
}

type CustomHexProps = {
	tile: CombatTile
	offset: [number, number]
}

function CustomHex({ tile, offset }: CustomHexProps) {
	const { isOver, active, setNodeRef } = useDroppable({
		id: tile.cord.toString()
	})

	return (
		<ContextMenu
			menuItems={(
				<>
					<Menu.Label>Characters</Menu.Label>
					<Menu.Item>Add Character</Menu.Item>
					<Menu.Item>Add Enemy</Menu.Item>
				</>
			)}
		>
			<Hex
				ref={setNodeRef}
				tile={tile}
				offset={offset}
				hexProps={{
					onDragStart: (e: Parameters<DragEventHandler<HTMLButtonElement>>[0]) => e.preventDefault()
				}}
			/>
		</ContextMenu>
	)
}
