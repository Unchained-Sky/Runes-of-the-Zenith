import { Button, Card, Group, rem, Stack, Text, Title } from '@mantine/core'
import { type LoaderFunctionArgs } from '@remix-run/node'
import { json, Link, redirect, useLoaderData, type MetaFunction } from '@remix-run/react'
import { getUserId } from '~/supabase/getUserId'
import { requireAccount } from '~/supabase/requireAccount'

export const meta: MetaFunction = () => {
	return [
		{ title: 'My Campaigns' }
	]
}

export async function loader({ request }: LoaderFunctionArgs) {
	const { supabase, headers } = await requireAccount(request)

	const { userId } = await getUserId(supabase)

	const { data: gmCampaigns, error } = await supabase
		.from('campaign_info')
		.select('campaign_id, campaign_name')
		.eq('user_id', userId)
	if (error) throw redirect('/', { headers })

	return json({ gmCampaigns }, { headers })
}

export default function Campaigns() {
	const { gmCampaigns } = useLoaderData<typeof loader>()

	return (
		<Stack>
			<Title>My Campaigns</Title>

			<Button w={rem(240)} component={Link} to='/campaign/create'>Create Campaign</Button>

			<Title order={2}>GM</Title>
			<Group>
				{
					gmCampaigns.map(campaign => {
						return <CampaignCard key={campaign.campaign_id} {...campaign} />
					})
				}
			</Group>

			<Title order={2}>Player</Title>
			<Group>
				<Text>None</Text>
			</Group>
		</Stack>
	)
}

type CampaignCardProps = {
	campaign_id: number
	campaign_name: string
}

function CampaignCard({ campaign_id, campaign_name }: CampaignCardProps) {
	return (
		<Card>
			<Title order={3}>{campaign_name}</Title>
			<Button component={Link} to={`/campaign/${campaign_id}`}>View Campaign</Button>
		</Card>
	)
}
