import { Title } from '@mantine/core'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { type } from 'arktype'
import { requireAccount } from '~/supabase/requireAccount'

export const Route = createFileRoute('/tabletop/$campaignId/player/')({
	component: RouteComponent,
	loader: async ({ params: { campaignId } }) => await serverLoader({ data: { campaignId: +campaignId } }),
	head: ({ loaderData }) => ({
		meta: loaderData ? [{ title: loaderData.campaignName }] : undefined
	})
})

const serverLoaderSchema = type({
	campaignId: 'number'
})

const serverLoader = createServerFn({ method: 'GET' })
	.validator(serverLoaderSchema)
	.handler(async ({ data: { campaignId } }) => {
		const { supabase } = await requireAccount({ backlink: '/tabletop/$id/player' })

		const { data, error } = await supabase
			.from('campaign_info')
			.select('campaign_name')
			.eq('campaign_id', campaignId)
			.limit(1)
			.maybeSingle()
		if (error) throw new Error(error.message, { cause: error })
		if (!data) throw redirect({ to: '/campaign' })

		return {
			campaignName: data.campaign_name
		}
	})

function RouteComponent() {
	const { campaignName } = Route.useLoaderData()

	return <Title>{campaignName}</Title>
}
