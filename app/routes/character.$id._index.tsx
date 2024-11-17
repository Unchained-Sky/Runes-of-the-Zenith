import { Button, rem, Stack, Text, Title } from '@mantine/core'
import { json, type LoaderFunctionArgs, type MetaFunction } from '@remix-run/node'
import { Link, redirect, useLoaderData } from '@remix-run/react'
import { getServerClient } from '~/supabase/getServerClient'
import { getUserId } from '~/supabase/getUserId'
import { isNumberParam } from '~/utils/isNumberParam'

export const meta: MetaFunction<typeof loader> = ({ data }) => {
	return [
		{ title: data?.characterName ?? 'Character' }
	]
}

export async function loader({ params, request }: LoaderFunctionArgs) {
	const characterId = isNumberParam(params.id, request.headers)

	const { supabase, headers } = getServerClient(request)

	const { data, error } = await supabase
		.from('character_info')
		.select(`
			characterName:character_name,
			userId:user_id,
			campaignInfo:campaign_info(
				campaignName:campaign_name
			)
		`)
		.eq('character_id', characterId)
	if (error || !data.length) throw redirect('/character', { headers })

	const characterUserId = data[0].userId
	const accountUserId = (await getUserId(supabase)).userId

	return json({
		characterName: data[0].characterName,
		campaignName: data[0].campaignInfo?.campaignName ?? null,
		characterId,
		isOwner: characterUserId === accountUserId
	}, { headers })
}

export default function Character() {
	const { characterName, campaignName, characterId, isOwner } = useLoaderData<typeof loader>()

	return (
		<Stack>
			<Title>{characterName}</Title>

			<Text>Linked campaign: {campaignName ?? 'None'}</Text>

			{isOwner && <Button component={Link} to={`/character/${characterId}/settings`} maw={rem(240)}>Edit Settings</Button>}
		</Stack>
	)
}
