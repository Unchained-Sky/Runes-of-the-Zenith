import { Drawer, Image, SimpleGrid, UnstyledButton } from '@mantine/core'
import { useMapEditStore } from '../useMapEditStore'

export default function TileEditPanel() {
	const selectedTiles = useMapEditStore(state => state.selectedTiles)
	const clearSelectedTiles = useMapEditStore(state => state.clearSelectedTiles)

	return (
		<Drawer
			opened={selectedTiles.length > 0}
			onClose={() => clearSelectedTiles()}
			withOverlay={false}
			position='right'
			styles={{
				header: {
					backgroundColor: 'var(--mantine-color-dark-6)'
				},
				content: {
					backgroundColor: 'var(--mantine-color-dark-6)'
				}
			}}
			title={`Editing ${selectedTiles.length} tiles`}
		>
			<TileImage />
		</Drawer>
	)
}

function TileImage() {
	const updateTiles = useMapEditStore(state => state.updateTiles)

	return (
		<SimpleGrid cols={3} spacing='md'>
			{['grass', 'rock'].map(image => {
				return (
					<UnstyledButton key={image} onClick={() => updateTiles({ image })}>
						<Image src={`/combatTiles/${image}.png`} />
					</UnstyledButton>
				)
			})}
		</SimpleGrid>
	)
}
