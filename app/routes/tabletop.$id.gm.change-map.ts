import { redirect, type ActionFunctionArgs } from '@remix-run/node'
import { getServiceClient } from '~/supabase/getServiceClient'
import { getUserId } from '~/supabase/getUserId'
import { requireAccount } from '~/supabase/requireAccount'
import { isNumberParam, safeParseInt } from '~/utils/isNumberParam'

export async function action({ params, request }: ActionFunctionArgs) {
	const campaignId = isNumberParam(params.id, request.headers)

	const { supabase, headers } = await requireAccount(request)
	const { userId } = await getUserId(supabase)

	{
		const { data, error } = await supabase
			.from('campaign_info')
			.select('user_id')
			.eq('campaign_id', campaignId)
		if (error) throw new Error(error.message, { cause: error })
		if (data[0].user_id !== userId) return redirect(`/tabletop/${campaignId}/gm`, { headers })
	}

	const formData = await request.formData()
	const mapId = safeParseInt(formData.get('mapId')?.toString() ?? '')
	if (!mapId) return redirect(`/tabletop/${campaignId}/gm`, { headers })

	{
		const { data, error } = await supabase
			.from('map_info')
			.select('mapType: map_type')
			.eq('map_id', mapId)
		if (error) throw new Error(error.message, { cause: error })
		if (!data.length) redirect(`/tabletop/${campaignId}/gm`, { headers })
	}

	const serviceClient = getServiceClient()

	{
		const { error } = await serviceClient
			.from('tabletop_info')
			.upsert({ map_id: mapId, campaign_id: campaignId })
			.eq('campaign_id', campaignId)
		if (error) throw new Error(error.message, { cause: error })
	}

	return redirect(`/tabletop/${campaignId}/gm`, { headers })
}
