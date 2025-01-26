import { Title } from '@mantine/core'
import { json, redirect, type LoaderFunctionArgs, type MetaFunction } from '@remix-run/node'
import { requireAccount } from '~/supabase/requireAccount'
import { safeParseInt } from '~/utils/isNumberParam'

export const meta: MetaFunction<typeof loader> = ({ data }) => {
	return [
		{ title: data?.campaignName ?? 'Campaign' }
	]
}

export async function loader({ params, request }: LoaderFunctionArgs) {
	const campaignIdParam = params.id
	if (!campaignIdParam) throw redirect('/tabletop', { headers: request.headers })
	const campaignId = safeParseInt(campaignIdParam) ?? 0

	const { supabase, headers } = await requireAccount(request)
	const { data, error } = await supabase
		.from('campaign_info')
		.select('campaignName: campaign_name')
		.eq('campaign_id', campaignId)
	if (error || !data.length) throw redirect(`/tabletop/${campaignIdParam}`, { headers })

	return json({
		campaignName: data[0].campaignName
	}, { headers })
}

export default function Route() {
	return <Title>Player</Title>
}
