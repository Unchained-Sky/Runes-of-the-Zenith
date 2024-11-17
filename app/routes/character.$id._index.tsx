import { Button, rem, Stack, Text, Title } from '@mantine/core'
import { json, type LoaderFunctionArgs, type MetaFunction } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'
import { getCampaignData } from 'app/.server/data/getCampaignData'
import { getCharacterData } from 'app/.server/data/getCharacterData'
import { getServerClient } from '~/supabase/getServerClient'
import { isNumberParam } from '~/utils/isNumberParam'

export const meta: MetaFunction<typeof loader> = ({ data }) => {
	return [
		{ title: data?.characterName ?? 'Character' }
	]
}

export async function loader({ params, request }: LoaderFunctionArgs) {
	const characterId = isNumberParam(params.id, request.headers)

	const serverClient = getServerClient(request)

	const { character_name, campaign_id } = await getCharacterData('character_name, campaign_id', characterId, serverClient)
	const { campaign_name } = campaign_id ? await getCampaignData('campaign_name', campaign_id, serverClient) : { campaign_name: null }

	return json({
		characterName: character_name,
		campaignName: campaign_name,
		characterId
	}, { headers: serverClient.headers })
}

export default function Character() {
	const { characterName, campaignName, characterId } = useLoaderData<typeof loader>()

	return (
		<Stack>
			<Title>{characterName}</Title>

			<Text>Linked campaign: {campaignName ?? 'None'}</Text>

			<Button component={Link} to={`/character/${characterId}/settings`} maw={rem(240)}>Edit Settings</Button>
		</Stack>
	)
}
