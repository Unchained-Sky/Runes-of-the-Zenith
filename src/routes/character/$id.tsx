import { Button, rem, Stack, Text, Title } from '@mantine/core'
import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { type } from 'arktype'
import { getUserId } from '~/supabase/getUserId'
import { requireAccount } from '~/supabase/requireAccount'

export const Route = createFileRoute('/character/$id')({
	component: RouteComponent,
	loader: async ({ params: { id } }) => await serverLoader({ data: { characterId: id } }),
	head: ({ loaderData }) => ({
		meta: loaderData
			? [{ title: `Character: ${loaderData.characterName}` }]
			: undefined
	})
})

const serverLoaderSchema = type({
	characterId: 'string.digits'
})

const serverLoader = createServerFn({ method: 'GET' })
	.validator(serverLoaderSchema)
	.handler(async ({ data: { characterId: CharacterIdString } }) => {
		const characterId = parseInt(CharacterIdString)

		const { supabase } = await requireAccount({ backlink: '/character' })

		const { data, error } = await supabase
			.from('character_info')
			.select(`
				character_name,
				user_id,
				campaign_info(
					campaign_name
				)
			`)
			.eq('character_id', characterId)
			.limit(1)
			.maybeSingle()
		if (error) throw new Error(error.message, { cause: error })

		if (!data) throw redirect({ to: '/character' })

		const { userId } = await getUserId(supabase)

		return {
			characterName: data.character_name,
			campaignName: data.campaign_info?.campaign_name ?? null,
			characterId,
			isOwner: data.user_id === userId
		}
	})

function RouteComponent() {
	const { characterName, campaignName, characterId, isOwner } = Route.useLoaderData()

	return (
		<Stack>
			<Title>{characterName}</Title>

			<Text>Linked campaign: {campaignName ?? 'None'}</Text>

			{isOwner && (
				<Button
					component={Link}
					to={`/character/${characterId}/settings`}
					maw={rem(240)}
				>
					Edit Settings
				</Button>
			)}
		</Stack>
	)
}
