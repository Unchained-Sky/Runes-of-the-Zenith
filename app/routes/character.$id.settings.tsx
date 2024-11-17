import { Button, rem, Select, Stack, Switch, Title } from '@mantine/core'
import { type ActionFunctionArgs, json, type LoaderFunctionArgs, type MetaFunction } from '@remix-run/node'
import { Form, redirect, useLoaderData } from '@remix-run/react'
import { getCharacterData } from 'app/.server/data/getCharacterData'
import { getServerClient } from '~/supabase/getServerClient'
import { getServiceClient } from '~/supabase/getServiceClient'
import { getUserId } from '~/supabase/getUserId'
import { requireAccount } from '~/supabase/requireAccount'
import { isNumberParam, safeParseInt } from '~/utils/isNumberParam'

export const meta: MetaFunction<typeof loader> = ({ data }) => {
	return [
		{ title: data?.characterName ?? 'Character' }
	]
}

export async function loader({ params, request }: LoaderFunctionArgs) {
	const characterId = isNumberParam(params.id, request.headers)

	const serverClient = getServerClient(request)
	const { supabase, headers } = serverClient

	const {
		character_name,
		campaign_id,
		user_id,
		visibility
	} = await getCharacterData('character_name, campaign_id, user_id, visibility', characterId, serverClient)

	const accountUserId = (await getUserId(supabase)).userId
	if (user_id !== accountUserId) throw redirect(`/character/${characterId}`, { headers })

	const { data, error } = await supabase
		.from('campaign_info')
		.select('campaign_id, campaign_name')
	if (error) throw redirect('/', { headers })

	return json({
		characterName: character_name,
		campaignId: campaign_id,
		campaigns: data,
		visibility
	}, { headers })
}

export async function action({ params, request }: ActionFunctionArgs) {
	const { supabase, headers } = await requireAccount(request)

	const formData = await request.formData()

	const linkedCampaign = formData.get('linked_campaign')?.toString() ?? ''
	const campaignId = safeParseInt(linkedCampaign)

	const visibility = formData.get('private') === 'on' ? 'PRIVATE' : 'PUBLIC'

	const serviceClient = getServiceClient()
	const characterId = isNumberParam(params.id, request.headers)
	const { userId } = await getUserId(supabase)

	const { error } = await serviceClient
		.from('character_info')
		.update({ campaign_id: campaignId, visibility })
		.eq('character_id', characterId)
		.eq('user_id', userId)
	if (error) throw new Error(error.message, { cause: error })

	return redirect(`/character/${characterId}`, { headers })
}

export default function Character() {
	const { characterName, campaignId, campaigns, visibility } = useLoaderData<typeof loader>()

	return (
		<Stack>
			<Title>{characterName}</Title>

			<Form method='POST'>
				<Stack maw={rem(240)}>
					<Select
						label='Linked Campaign'
						name='linked_campaign'
						data={campaigns.map(({ campaign_id, campaign_name }) => ({ value: campaign_id.toString(), label: campaign_name }))}
						defaultValue={campaignId?.toString()}
					/>

					<Switch
						defaultChecked={visibility === 'PRIVATE'}
						label='Private'
						name='private'
						description='Private characters can still be viewed to members of the same campaign'
					/>

					<Button type='submit'>Save</Button>
				</Stack>
			</Form>
		</Stack>
	)
}
