import { Box, Button, Group, Stack, Title } from '@mantine/core'
import { type ActionFunctionArgs, type LoaderFunctionArgs } from '@remix-run/node'
import { Form, json, type MetaFunction, redirect, useLoaderData } from '@remix-run/react'
import HoneycombGrid from '~/components/HoneycombGrid'
import { type CombatMap, type CombatMapTemplateName, getAllCombatMapTemplates, getCombatMapTemplate } from '~/data/mapTemplates/combat'
import { type Tables } from '~/supabase/databaseTypes'
import { getServerClient } from '~/supabase/getServerClient'
import { requireAccount } from '~/supabase/requireAccount'
import { isNumberParam } from '~/utils/isNumberParam'

export const meta: MetaFunction<typeof loader> = ({ data }) => {
	return [
		{ title: data?.mapName ?? 'Map' }
	]
}

export async function loader({ params, request }: LoaderFunctionArgs) {
	const mapId = isNumberParam(params.id, request.headers)

	const { supabase, headers } = getServerClient(request)

	const { data, error } = await supabase
		.from('map_info')
		.select(`
			mapName:name,
			mapId:map_id,
			tileCount:map_combat_tile(count)
		`)
		.eq('map_id', mapId)
	if (error || !data.length) throw redirect('/homebrew/map', { headers })

	if (data[0].tileCount[0].count) throw redirect(`/homebrew/map/${mapId}/edit`, { headers })

	return json(data[0], { headers })
}

export async function action({ params, request }: ActionFunctionArgs) {
	const { supabase, headers } = await requireAccount(request)

	const mapId = isNumberParam(params.id, request.headers)
	const formData = await request.formData()

	const templateName = formData.get('_template') as CombatMapTemplateName
	const mapData = getCombatMapTemplate(templateName)
	const formattedMapData = mapData.tiles
		.map<Tables<'map_combat_tile'>>(({
			cord: [q, r, s], image, terrainType
		}) => ({
			q, r, s, image, terrain_type: terrainType, map_id: mapId
		}))

	const { error } = await supabase
		.from('map_combat_tile')
		.insert(formattedMapData)
	if (error) throw new Error(error.message, { cause: error })

	return redirect(`/homebrew/map/${mapId}/edit`, { headers })
}

export default function MapTemplates() {
	const { mapName } = useLoaderData<typeof loader>()

	const templates = getAllCombatMapTemplates()

	return (
		<Box>
			<Title>{mapName} - Templates</Title>

			<Group align='flex-start' justify='space-around'>
				{
					templates.map(template => {
						return <Template key={template.name} {...template} />
					})
				}
			</Group>
		</Box>
	)
}

type TemplateProps = CombatMap

function Template({ name, tiles }: TemplateProps) {
	return (
		<Stack>
			<Title order={2}>{name}</Title>

			<HoneycombGrid tiles={tiles} />

			<Form method='POST'>
				<input type='text' name='_template' value={name} hidden readOnly />
				<Button type='submit'>Select Template</Button>
			</Form>
		</Stack>
	)
}
