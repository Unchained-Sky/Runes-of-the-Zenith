import { redirect, type ActionFunctionArgs } from '@remix-run/node'
import { requireAccount } from '~/supabase/requireAccount'

export async function action({ request }: ActionFunctionArgs) {
	const { supabase, headers } = await requireAccount(request)

	const { data, error } = await supabase
		.from('map_info')
		.insert({
			map_type: 'COMBAT'
		})
		.select('mapId:map_id')
	if (error) throw new Error(error.message, { cause: error })

	const { mapId } = data[0]

	return redirect(`/homebrew/map/${mapId}`, { headers })
}
