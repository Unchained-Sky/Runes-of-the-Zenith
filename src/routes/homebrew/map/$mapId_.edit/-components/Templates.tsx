import { Box, Button, Group, Stack, Title } from '@mantine/core'
import { getRouteApi } from '@tanstack/react-router'
import CombatGridPreview from '~/components/HoneycombGrid/CombatGridPreview'
import { type CombatMapTemplate, getAllCombatMapTemplates } from '~/data/mapTemplates/combatMapTemplate'
import { useMapEditStore } from '../-hooks/useMapEditStore'

export default function Templates() {
	const { mapName } = getRouteApi('/homebrew/map/$mapId_/edit/').useLoaderData()

	const templates = getAllCombatMapTemplates()

	return (
		<Box>
			<Title>Templates - {mapName}</Title>

			<Group align='flex-start' justify='space-around'>
				{templates.map(template => {
					return <Template key={template.name} {...template} />
				})}
			</Group>
		</Box>
	)
}

type TemplateProps = CombatMapTemplate

function Template({ name, tiles }: TemplateProps) {
	const addTiles = useMapEditStore(state => state.addTiles)

	return (
		<Stack>
			<Title order={2}>{name}</Title>

			<CombatGridPreview tiles={tiles} />

			<Button
				onClick={() => addTiles(tiles)}
			>Select Template
			</Button>
		</Stack>
	)
}
