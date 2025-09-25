import { Button, rem, Stack, Title } from '@mantine/core'
import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { type } from 'arktype'
import { requireAccount } from '~/supabase/requireAccount'

export const Route = createFileRoute('/homebrew/map/$mapId')({
	component: RouteComponent,
	loader: async ({ params: { mapId } }) => await serverLoader({ data: { mapId: +mapId } }),
	head: ({ loaderData }) => ({
		meta: loaderData ? [{ title: `Map: ${loaderData.mapName}` }] : undefined
	})
})

const serverLoaderSchema = type({
	mapId: 'number'
})

const serverLoader = createServerFn({ method: 'GET' })
	.validator(serverLoaderSchema)
	.handler(async ({ data: { mapId } }) => {
		const { supabase } = await requireAccount({ backlink: '/homebrew/map' })

		const { data, error } = await supabase
			.from('map_info')
			.select(`
				mapName: map_name,
				mapId: map_id
			`)
			.eq('map_id', mapId)
			.limit(1)
			.maybeSingle()
		if (error) throw new Error(error.message, { cause: error })
		if (!data) throw redirect({ to: '/homebrew/map' })

		return data
	})

function RouteComponent() {
	const { mapName, mapId } = Route.useLoaderData()

	return (
		<Stack>
			<Title>{mapName}</Title>
			<Button
				maw={rem(240)}
				component={Link}
				to={`/homebrew/map/${mapId}/edit`}
			>
				Edit
			</Button>
		</Stack>
	)
}
