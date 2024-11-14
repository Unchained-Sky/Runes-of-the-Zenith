import { Stack, Title } from '@mantine/core'
import { json, redirect, type LoaderFunctionArgs, type MetaFunction } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { getServerClient } from '~/supabase/getServerClient'
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
		.from('characters')
		.select('character_name')
		.eq('character_id', characterId)
	if (error || !data.length) throw redirect('/', { headers })

	const { character_name } = data[0]

	return json({ characterName: character_name }, { headers })
}

export default function Character() {
	const { characterName } = useLoaderData<typeof loader>()

	return (
		<Stack>
			<Title>{characterName}</Title>
		</Stack>
	)
}
