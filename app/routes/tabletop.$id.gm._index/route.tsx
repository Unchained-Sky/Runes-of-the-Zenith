import { json, redirect, type LoaderFunctionArgs, type MetaFunction } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { CombatGridTabletopGM } from '~/components/HoneycombGrid'
import { getUserId } from '~/supabase/getUserId'
import { requireAccount } from '~/supabase/requireAccount'
import { safeParseInt } from '~/utils/isNumberParam'
import SettingsPanel from './components/SettingsPanel'
import { getCampaignName, getMaps, getTiles, type LoaderOptions } from './loader'

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
	const { userId } = (await getUserId(supabase))

	const loaderOptions: LoaderOptions = {
		supabase,
		headers,
		campaignId,
		userId
	}

	const [
		campaignName,
		tiles,
		maps
	] = await Promise.all([
		getCampaignName(loaderOptions),
		getTiles(loaderOptions),
		getMaps(loaderOptions)
	])

	return json({
		campaignId,
		campaignName,
		tiles,
		maps
	}, { headers })
}

export default function Route() {
	const { tiles } = useLoaderData<typeof loader>()

	return (
		<>
			<CombatGridTabletopGM tiles={tiles} />

			<SettingsPanel />
		</>
	)
}
