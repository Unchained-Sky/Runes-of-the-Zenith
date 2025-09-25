import { Button, Code, Group, rem, Stack, Text, Title } from '@mantine/core'
import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { type } from 'arktype'
import { getSupabaseServerClient } from '~/supabase/getSupabaseServerClient'
import { getUserId } from '~/supabase/getUserId'

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
		const supabase = getSupabaseServerClient()

		const { data, error } = await supabase
			.from('campaign_info')
			.select(`
				campaign_name,
				invite_id,
				campaign_owner_id: user_id,
				hero_info (
					hero_name,
					hero_id
				)	
			`)
			.eq('campaign_id', campaignId)
			.limit(1)
			.maybeSingle()
		if (error) throw new Error(error.message, { cause: error })
		if (!data) throw redirect({ to: '/campaign' })

		const { userId } = await getUserId(supabase)

		return {
			campaignName: data.campaign_name,
			heroInfo: data.hero_info,
			inviteId: data.invite_id,
			isOwner: data.campaign_owner_id === userId
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
					? heroInfo.map(({ hero_name, hero_id }) => {
						return (
							<Button
								key={hero_id}
								component={Link}
								to='/hero/${hero_id}'
							>
								{hero_name}
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
