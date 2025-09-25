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
		.select(`
			campaignId: campaign_id,
			campaignName: campaign_name
		`)
		.eq('user_id', user.id)
	if (gmError) throw new Error(gmError.message, { cause: gmError })

	const { data: playerCampaigns, error: playerError } = await supabase
		.from('campaign_users')
		.select(`
			campaignId: campaign_id,
			campaignInfo: campaign_info (
				campaignName: campaign_name
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
				{gmCampaigns.map(({ campaignId, campaignName }) => {
					return (
						<CampaignCard
							key={campaignId}
							campaignId={campaignId}
							campaignName={campaignName}
						/>
					)
				})}
			</Group>

			<Title order={2}>Player</Title>
			<Group>
				{playerCampaigns.map(({	campaignId, campaignInfo }) => {
					return (
						<CampaignCard
							key={campaignId}
							campaignId={campaignId}
							campaignName={campaignInfo.campaignName}
						/>
					)
				})}
			</Group>
		</Stack>
	)
}

type CampaignCardProps = {
	campaignId: number
	campaignName: string
}

function CampaignCard({ campaignId, campaignName }: CampaignCardProps) {
	return (
		<Card>
			<Title order={3}>{campaignName}</Title>
			<Button component={Link} to={`/campaign/${campaignId}`}>View Campaign</Button>
		</Card>
	)
}
