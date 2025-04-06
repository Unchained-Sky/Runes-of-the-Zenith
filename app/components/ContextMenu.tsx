import { Affix, Box, Menu } from '@mantine/core'
import { useClickOutside } from '@mantine/hooks'
import { type ReactNode, useState } from 'react'

type Coords = { x: number, y: number } | { x: null, y: null }

type ContextMenuProps = {
	children: ReactNode
	menuItems: ReactNode
}

export default function ContextMenu({ children, menuItems }: ContextMenuProps) {
	const [coords, setCoords] = useState<Coords>({ x: null, y: null })
	const ref = useClickOutside(() => setCoords({ x: null, y: null }))
	const showMenu = coords.x !== null

	return (
		<>
			<Box
				onContextMenu={event => {
					event.preventDefault()
					setCoords({ x: event.clientX, y: event.clientY })
				}}
			>
				{children}
			</Box>

			<Affix
				style={{ display: showMenu ? 'initial' : 'none' }}
				position={showMenu ? { left: coords.x, top: coords.y } : undefined}
			>
				<Menu opened={showMenu}>
					<Box ref={ref}>
						<Menu.Target>
							<Box />
						</Menu.Target>
						<Menu.Dropdown>
							{menuItems}
						</Menu.Dropdown>
					</Box>
				</Menu>
			</Affix>
		</>
	)
}
