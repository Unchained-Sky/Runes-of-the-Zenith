import { Button, rem, Stack, Text, Title } from '@mantine/core'
import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { type } from 'arktype'
import { requireAccount } from '~/supabase/requireAccount'

export const Route = createFileRoute('/hero/$heroId')({
	component: RouteComponent,
	loader: async ({ params: { heroId } }) => await serverLoader({ data: { heroId: +heroId } }),
	head: ({ loaderData }) => ({
		meta: loaderData
			? [{ title: `Hero: ${loaderData.heroName}` }]
			: undefined
	})
})

const serverLoaderSchema = type({
	heroId: 'number'
})

const serverLoader = createServerFn({ method: 'GET' })
	.validator(serverLoaderSchema)
	.handler(async ({ data: { heroId } }) => {
		const { supabase, user } = await requireAccount({ backlink: '/hero' })

		const { data, error } = await supabase
			.from('hero_info')
			.select(`
				heroName: hero_name,
				heroUserId: user_id,
				campaignInfo: campaign_info (
					campaignName:campaign_name
				)
			`)
			.eq('hero_id', heroId)
			.limit(1)
			.maybeSingle()
		if (error) throw new Error(error.message, { cause: error })
		if (!data) throw redirect({ to: '/hero' })

		return {
			heroId,
			heroName: data.heroName,
			campaignName: data.campaignInfo?.campaignName ?? null,
			isOwner: data.heroUserId === user.id
		}
	})

function RouteComponent() {
	const { heroId, heroName, campaignName, isOwner } = Route.useLoaderData()

	return (
		<Stack>
			<Title>{heroName}</Title>

			<Text>Linked campaign: {campaignName ?? 'None'}</Text>

			{isOwner && (
				<Button
					component={Link}
					to={`/hero/${heroId}/settings`}
					maw={rem(240)}
				>
					Edit Settings
				</Button>
			)}
		</Stack>
	)
}
