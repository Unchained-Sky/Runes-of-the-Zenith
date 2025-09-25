import { Button, Stack, Text, Title } from '@mantine/core'
import { useMutation } from '@tanstack/react-query'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { type } from 'arktype'
import { createHash } from 'node:crypto'
import { getServiceClient } from '~/supabase/getServiceClient'
import { requireAccount } from '~/supabase/requireAccount'

export const Route = createFileRoute('/campaign/join/$inviteId')({
	component: RouteComponent,
	loader: async ({ params: { inviteId } }) => await serverLoader({ data: { inviteId } }),
	head: ({ loaderData }) => ({
		meta: loaderData
			? [{ title: `Join Campaign: ${loaderData.campaignName}` }]
			: undefined
	})
})

const serverLoaderSchema = type({
	inviteId: 'string'
})

const serverLoader = createServerFn({ method: 'GET' })
	.validator(serverLoaderSchema)
	.handler(async ({ data: { inviteId } }) => {
		const { supabase } = await requireAccount()

		// If the user can see the campaign id,
		// they're already in it as either a player or the GM
		const { data: inviteData } = await supabase
			.from('campaign_info')
			.select('campaignId: campaign_id')
			.eq('invite_id', inviteId)
			.limit(1)
			.maybeSingle()
		if (inviteData) throw redirect({
			to: '/campaign/$campaignId',
			params: { campaignId: inviteData.campaignId.toString() }
		})

		const serverClient = getServiceClient()
		const { data: campaignData } = await serverClient
			.from('campaign_info')
			.select('campaignName: campaign_name')
			.eq('invite_id', inviteId)
			.limit(1)
			.maybeSingle()
		if (!campaignData) throw redirect({ to: '/campaign' })

		return {
			campaignName: campaignData.campaignName
		}
	})

function RouteComponent() {
	const { campaignName } = Route.useLoaderData()
	const { inviteId } = Route.useParams()

	const joinCampaign = useMutation({
		mutationFn: joinCampaignAction
	})

	return (
		<Stack>
			<Title>{campaignName}</Title>
			<Text>{`You've been invited to join ${campaignName}`}</Text>
			<Button
				loading={!!joinCampaign.submittedAt}
				onClick={() => joinCampaign.mutate({ data: { inviteId } })}
			>Accept
			</Button>
		</Stack>
	)
}

const joinCampaignSchema = type({
	inviteId: 'string'
})

const joinCampaignAction = createServerFn({ method: 'POST' })
	.validator(joinCampaignSchema)
	.handler(async ({ data: { inviteId } }) => {
		const { supabase, user } = await requireAccount()

		// Same check as in loader
		const { data: inviteData } = await supabase
			.from('campaign_info')
			.select('campaignId: campaign_id')
			.eq('invite_id', inviteId)
			.limit(1)
			.maybeSingle()
		if (inviteData) throw redirect({
			to: '/campaign/$campaignId',
			params: { campaignId: inviteData.campaignId.toString() }
		})

		const serverClient = getServiceClient()
		const { data: campaignData } = await serverClient
			.from('campaign_info')
			.select('campaignId: campaign_id')
			.eq('invite_id', inviteId)
			.limit(1)
			.maybeSingle()
		if (!campaignData) throw redirect({ to: '/campaign' })

		const { campaignId } = campaignData
		const idHash = createHash('md5').update(`${user.id}_${campaignId}`).digest('hex')

		await supabase
			.from('campaign_users')
			.insert({
				user_id: user.id,
				campaign_id: campaignId,
				id_hash: idHash
			})

		throw redirect({
			to: '/campaign/$campaignId',
			params: { campaignId: campaignId.toString() }
		})
	})
