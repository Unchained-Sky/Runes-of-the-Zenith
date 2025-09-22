import { Button, rem, Stack, Title } from '@mantine/core'
import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { type } from 'arktype'
import { requireAccount } from '~/supabase/requireAccount'

export const Route = createFileRoute('/homebrew/map/$id')({
	component: RouteComponent,
	loader: async ({ params: { id } }) => await serverLoader({ data: { mapId: id } }),
	head: ({ loaderData }) => ({
		meta: loaderData ? [{ title: `Map: ${loaderData.map_name}` }] : undefined
	})
})

const serverLoaderSchema = type({
	mapId: 'string.digits'
})

const serverLoader = createServerFn({ method: 'GET' })
	.validator(serverLoaderSchema)
	.handler(async ({ data: { mapId: mapIdString } }) => {
		const mapId = parseInt(mapIdString)

		const { supabase } = await requireAccount({ backlink: '/homebrew/map' })

		const { data, error } = await supabase
			.from('map_info')
			.select('map_name, map_id')
			.eq('map_id', mapId)
			.limit(1)
			.maybeSingle()
		if (error) throw new Error(error.message, { cause: error })
		if (!data) throw redirect({ to: '/homebrew/map' })

		return data
	})

function RouteComponent() {
	const { map_name, map_id } = Route.useLoaderData()

	return (
		<Stack>
			<Title>{map_name}</Title>
			<Button
				maw={rem(240)}
				component={Link}
				to={`/homebrew/map/${map_id}/edit`}
			>
				Edit
			</Button>
		</Stack>
	)
}
