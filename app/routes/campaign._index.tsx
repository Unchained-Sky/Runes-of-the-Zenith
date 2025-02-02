import { Button, Card, Group, rem, Stack, Title } from '@mantine/core'
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

	const { data: gmCampaigns, error: gmError } = await supabase
		.from('campaign_info')
		.select('campaign_id, campaign_name')
		.eq('user_id', userId)
	if (gmError) throw redirect('/', { headers })

	const { data: playerCampaigns, error: playerError } = await supabase
		.from('campaign_users')
		.select(`
			campaign_id,
			campaign_info (
				campaign_name
			)
			`)
	if (playerError) throw redirect('/', { headers })

	return json({ gmCampaigns, playerCampaigns }, { headers })
}

export default function Campaigns() {
	const { gmCampaigns, playerCampaigns } = useLoaderData<typeof loader>()

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
				{
					playerCampaigns.map(({ campaign_id, campaign_info }) => {
						return (
							<CampaignCard
								key={campaign_id}
								campaign_id={campaign_id}
								campaign_name={campaign_info.campaign_name}
							/>
						)
					})
				}
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
