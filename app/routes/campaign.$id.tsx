import { Code, Group, Stack, Text, Title } from '@mantine/core'
import { json, redirect, type LoaderFunctionArgs } from '@remix-run/node'
import { useLoaderData, type MetaFunction } from '@remix-run/react'
import { getServerClient } from '~/supabase/getServerClient'
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
		.select('campaign_name, invite_id')
		.eq('campaign_id', campaignId)
	if (error || !data.length) throw redirect('/', { headers })

	const { campaign_name, invite_id } = data[0]

	return json({ campaignName: campaign_name, inviteId: invite_id }, { headers })
}

export default function CampaignPage() {
	const { campaignName, inviteId } = useLoaderData<typeof loader>()

	return (
		<Stack>
			<Title>{campaignName}</Title>
			<Group>
				<Text>Invite URL</Text>
				<Code>{`http://localhost:5173/campaign/join/${inviteId}`}</Code>
			</Group>
		</Stack>
	)
}
