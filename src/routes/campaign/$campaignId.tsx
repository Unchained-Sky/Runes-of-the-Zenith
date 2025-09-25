import { Button, Code, Group, rem, Stack, Text, Title } from '@mantine/core'
import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { type } from 'arktype'
import { requireAccount } from '~/supabase/requireAccount'

export const Route = createFileRoute('/campaign/$campaignId')({
	component: RouteComponent,
	loader: async ({ params: { campaignId } }) => await serverLoader({ data: { campaignId: +campaignId } }),
	head: ({ loaderData }) => ({
		meta: loaderData
			? [{ title: `Campaign: ${loaderData.campaignName}` }]
			: undefined
	})
})

const serverLoaderSchema = type({
	campaignId: 'number'
})

const serverLoader = createServerFn({ method: 'GET' })
	.validator(serverLoaderSchema)
	.handler(async ({ data: { campaignId } }) => {
		const { supabase, user } = await requireAccount()

		const { data, error } = await supabase
			.from('campaign_info')
			.select(`
				campaignName: campaign_name,
				inviteId: invite_id,
				campaignOwnerId: user_id,
				heroInfo: hero_info (
					heroName: hero_name,
					heroId:hero_id
				)	
			`)
			.eq('campaign_id', campaignId)
			.limit(1)
			.maybeSingle()
		if (error) throw new Error(error.message, { cause: error })
		if (!data) throw redirect({ to: '/campaign' })

		return {
			campaignName: data.campaignName,
			heroInfo: data.heroInfo,
			inviteId: data.inviteId,
			isOwner: data.campaignOwnerId === user.id
		}
	})

function RouteComponent() {
	const { campaignName, heroInfo, inviteId, isOwner } = Route.useLoaderData()
	const { campaignId } = Route.useParams()

	return (
		<Stack>
			<Title>{campaignName}</Title>

			<Group>
				<Text>Invite URL</Text>
				<Code>{`http://localhost:5173/campaign/join/${inviteId}`}</Code>
			</Group>

			<Title order={2}>Heroes:</Title>
			<Group>
				{heroInfo.length
					? heroInfo.map(({ heroName, heroId }) => {
						return (
							<Button
								key={heroId}
								component={Link}
								to='/hero/${hero_id}'
							>
								{heroName}
							</Button>
						)
					})
					: <Text fs='italic'>None</Text>}
			</Group>

			<Title order={2}>Tabletop</Title>
			<Button
				component={Link}
				to={`/tabletop/${campaignId}${isOwner ? '/gm' : ''}`}
				maw={rem(240)}
			>Play
			</Button>
		</Stack>
	)
}
