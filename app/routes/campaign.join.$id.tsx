import { Button, Stack, Text, Title } from '@mantine/core'
import { json, redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from '@remix-run/node'
import { Form, useLoaderData } from '@remix-run/react'
import { createHash } from 'node:crypto'
import { type Database } from '~/supabase/databaseTypes'
import { getServiceClient } from '~/supabase/getServiceClient'
import { getUserId } from '~/supabase/getUserId'
import { requireAccount } from '~/supabase/requireAccount'

export async function loader({ params, request }: LoaderFunctionArgs) {
	const inviteId = params.id
	if (!inviteId) throw redirect('/campaign', { headers: request.headers })

	const { headers } = await requireAccount(request)

	const { data, error } = await getCampaignInfo(inviteId, 'campaign_name')
	if (error || !data || !data.length) throw redirect('/', { headers })

	return json({ campaignName: data[0].campaign_name }, { headers })
}

export async function action({ params, request }: ActionFunctionArgs) {
	const inviteId = params.id
	if (!inviteId) throw redirect('/campaign', { headers: request.headers })

	const { supabase, headers } = await requireAccount(request)

	const { userId } = await getUserId(supabase)

	const { data, error } = await getCampaignInfo(inviteId, 'campaign_id')
	if (error || !data || !data.length) throw redirect('/campaign', { headers })

	const campaignId = data[0].campaign_id
	const idHash = createHash('md5').update(`${userId}_${campaignId}`).digest('hex')

	await supabase
		.from('campaign_users')
		.insert({
			user_id: userId,
			campaign_id: campaignId,
			id_hash: idHash
		})

	return redirect(`/campaign/${campaignId}`, { headers })
}

export default function CampaignJoinPage() {
	const { campaignName } = useLoaderData<typeof loader>()

	return (
		<Stack>
			<Title>{campaignName}</Title>
			<Text>{`You've been invited to join ${campaignName}`}</Text>
			<Form method='POST'>
				<Button type='submit'>Accept</Button>
			</Form>
		</Stack>
	)
}

type CampaignInfoColumn = Database['public']['Tables']['campaign_info']['Row']
type GetCampaignInfoReturn<T extends keyof CampaignInfoColumn> = {
	data: {
		[K in T]: CampaignInfoColumn[K]
	}[] | null
	error: {
		message: string
		details: string
		hint: string
		code: string
	} | null
}

async function getCampaignInfo<T extends keyof CampaignInfoColumn>(inviteId: string, select: T) {
	const supabaseService = getServiceClient()
	const { data, error } = await supabaseService
		.from('campaign_info')
		.select(select)
		.eq('invite_id', inviteId)
	return { data, error } as GetCampaignInfoReturn<T>
}
