import { Button, Card, Group, rem, Stack, Title } from '@mantine/core'
import { createFileRoute, Link } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { requireAccount } from '~/supabase/requireAccount'

export const Route = createFileRoute('/campaign/')({
	component: RouteComponent,
	loader: async () => await serverLoader(),
	head: () => ({
		meta: [{ title: 'Campaigns' }]
	})
})

const serverLoader = createServerFn({ method: 'GET' }).handler(async () => {
	const { supabase, user } = await requireAccount({ backlink: '/campaign' })

	const { data: gmCampaigns, error: gmError } = await supabase
		.from('campaign_info')
		.select('campaign_id, campaign_name')
		.eq('user_id', user.id)
	if (gmError) throw new Error(gmError.message, { cause: gmError })

	const { data: playerCampaigns, error: playerError } = await supabase
		.from('campaign_users')
		.select(`
			campaign_id,
			campaign_info (
				campaign_name
			)
		`)
	if (playerError) throw new Error(playerError.message, { cause: playerError })

	return { gmCampaigns, playerCampaigns }
})

function RouteComponent() {
	const { gmCampaigns, playerCampaigns } = Route.useLoaderData()

	return (
		<Stack>
			<Title>My Campaigns</Title>

			<Button
				w={rem(240)}
				component={Link}
				to='/campaign/create'
			>
				Create Campaign
			</Button>

			<Title order={2}>GM</Title>
			<Group>
				{gmCampaigns.map(campaign => {
					return <CampaignCard key={campaign.campaign_id} {...campaign} />
				})}
			</Group>

			<Title order={2}>Player</Title>
			<Group>
				{playerCampaigns.map(({ campaign_id, campaign_info }) => {
					return (
						<CampaignCard
							key={campaign_id}
							campaign_id={campaign_id}
							campaign_name={campaign_info.campaign_name}
						/>
					)
				})}
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
