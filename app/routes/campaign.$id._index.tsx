import { Button, Code, Group, rem, Stack, Text, Title } from '@mantine/core'
import { json, type LoaderFunctionArgs } from '@remix-run/node'
import { Link, redirect, useLoaderData, type MetaFunction } from '@remix-run/react'
import { getServerClient } from '~/supabase/getServerClient'
import { getUserId } from '~/supabase/getUserId'
import { isNumberParam } from '~/utils/isNumberParam'

export const meta: MetaFunction<typeof loader> = ({ data }) => {
	return [
		{ title: data?.campaignName ?? 'Campaign' }
	]
}

export async function loader({ params, request }: LoaderFunctionArgs) {
	const campaignId = isNumberParam(params.id, request.headers)

	const { supabase, headers } = getServerClient(request)

	const { data, error } = await supabase
		.from('campaign_info')
		.select(`
			campaignName: campaign_name,
			inviteId: invite_id,
			campaignOwnerId: user_id,
			characterInfo: character_info(
				name: character_name,
				id: character_id
			)
		`)
		.eq('campaign_id', campaignId)
	if (error || !data.length) throw redirect('/campaign', { headers })

	const isOwner = data[0].campaignOwnerId === (await getUserId(supabase)).userId

	return json({
		campaignName: data[0].campaignName,
		characterInfo: data[0].characterInfo,
		inviteId: data[0].inviteId,
		campaignId,
		isOwner
	}, { headers })
}

export default function CampaignPage() {
	const { campaignName, characterInfo, inviteId, campaignId, isOwner } = useLoaderData<typeof loader>()

	return (
		<Stack>
			<Title>{campaignName}</Title>
			<Group>
				<Text>Invite URL</Text>
				<Code>{`http://localhost:5173/campaign/join/${inviteId}`}</Code>
			</Group>

			<Title order={2}>Characters:</Title>
			<Group>
				{
					characterInfo.length
						? characterInfo.map(({ name, id }) => {
							return <Button key={id} component={Link} to={`/character/${id}`}>{name}</Button>
						})
						: <Text fs='italic'>None</Text>
				}
			</Group>

			<Title order={2}>Tabletop</Title>
			<Button component={Link} to={`/tabletop/${campaignId}${isOwner ? '/gm' : ''}`} maw={rem(240)}>Play</Button>
		</Stack>
	)
}
