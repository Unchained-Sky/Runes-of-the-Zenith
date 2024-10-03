import { Stack, Title } from '@mantine/core'
import { json, redirect, type LoaderFunctionArgs } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { requireAccess } from '~/supabase/requireAccess'
import { isNumberParam } from '~/utils/isNumberParam'

export async function loader({ params, request }: LoaderFunctionArgs) {
	const campaignId = isNumberParam(params.id, request.headers)
	const { supabase, headers } = await requireAccess(request, {
		table: 'campaign_owner',
		userColumn: 'user_id',
		selectColumn: 'campaign_id',
		selectValue: campaignId
	})

	const { data, error } = await supabase
		.from('campaign_owner')
		.select('campaign_name')
		.eq('campaign_id', campaignId)
	if (error) throw redirect('/', { headers })

	return json({ campaignName: data[0].campaign_name }, { headers })
}

export default function CampaignPage() {
	const { campaignName } = useLoaderData<typeof loader>()

	return (
		<Stack>
			<Title>{campaignName}</Title>
		</Stack>
	)
}
