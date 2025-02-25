import { Button, rem, Select, Stack, Switch, Title } from '@mantine/core'
import { type ActionFunctionArgs, type LoaderFunctionArgs, type MetaFunction } from '@remix-run/node'
import { Form, redirect, useLoaderData } from '@remix-run/react'
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

	const { supabase, headers } = getServerClient(request)

	const { data: characterData, error } = await supabase
		.from('character_info')
		.select(`
			characterName: character_name,
			campaignId: campaign_id,
			characterUserId: user_id,
			visibility
		`)
		.eq('character_id', characterId)
	if (error || !characterData.length) throw redirect('/', { headers })
	const { characterName, campaignId, characterUserId, visibility } = characterData[0]

	const accountUserId = (await getUserId(supabase)).userId
	if (characterUserId !== accountUserId) throw redirect(`/character/${characterId}`, { headers })

	const { data: campaignData, error: campaignError } = await supabase
		.from('campaign_info')
		.select('campaign_id, campaign_name')
	if (campaignError) throw redirect('/', { headers })

	return {
		characterName,
		campaignId,
		campaigns: campaignData,
		visibility
	}
}

export async function action({ params, request }: ActionFunctionArgs) {
	const { supabase, headers } = await requireAccount(request)

	const formData = await request.formData()
	const characterId = isNumberParam(params.id, request.headers)

	const linkedCampaign = formData.get('linked_campaign')
	if (typeof linkedCampaign !== 'string') return redirect(`/character/${characterId}`, { headers })
	const campaignId = safeParseInt(linkedCampaign)

	const visibility = formData.get('private') === 'on' ? 'PRIVATE' : 'PUBLIC'

	const serviceClient = getServiceClient()
	const { userId } = await getUserId(supabase)

	const { error } = await serviceClient
		.from('character_info')
		.update({ campaign_id: campaignId, visibility })
		.eq('character_id', characterId)
		.eq('user_id', userId)
	if (error) throw new Error(error.message, { cause: error })

	return redirect(`/character/${characterId}`, { headers })
}

export default function Route() {
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
