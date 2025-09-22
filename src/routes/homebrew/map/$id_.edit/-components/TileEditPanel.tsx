import { Button, Drawer, Image, SimpleGrid, Stack, UnstyledButton } from '@mantine/core'
import { useMapEditStore } from '../-hooks/useMapEditStore'

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
			<Drawer.Body component={Stack}>
				<TileImage />
				<DeleteTiles />
			</Drawer.Body>
		</Drawer>
	)
}

function TileImage() {
	const updateTiles = useMapEditStore(state => state.updateSelectedTiles)

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

function DeleteTiles() {
	const deleteSelectedTiles = useMapEditStore(state => state.deleteSelectedTiles)

	return <Button color='red' onClick={deleteSelectedTiles}>Delete Tiles</Button>
}
