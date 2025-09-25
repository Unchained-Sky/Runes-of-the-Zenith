import { Box, Button, Group, Stack, Title } from '@mantine/core'
import { getRouteApi } from '@tanstack/react-router'
import CombatGridPreview from '~/components/HoneycombGrid/CombatGridPreview'
import { type CombatMap, getAllCombatMapTemplates } from '~/data/mapTemplates/combat'
import { useMapEditStore } from '../-hooks/useMapEditStore'

export default function Templates() {
	const { map_name } = getRouteApi('/homebrew/map/$mapId_/edit/').useLoaderData()

	const templates = getAllCombatMapTemplates()

	return (
		<Box>
			<Title>Templates - {map_name}</Title>

			<Group align='flex-start' justify='space-around'>
				{templates.map(template => {
					return <Template key={template.name} {...template} />
				})}
			</Group>
		</Box>
	)
}

type TemplateProps = CombatMap

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
