import { redirect, type LoaderFunctionArgs, type MetaFunction } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import useMountEffect from '~/hooks/useMountEffect'
import { getUserId } from '~/supabase/getUserId'
import { requireAccount } from '~/supabase/requireAccount'
import { safeParseInt } from '~/utils/isNumberParam'
import CombatGridTabletopGM from './components/CombatGridTabletopGM'
import SettingsPanel from './components/SettingsPanel'
import { getCampaignName, getCharacters, getMaps, getTiles, type LoaderOptions } from './loader'
import { useTabletopGMStore } from './useTabletopGMStore'
import useTabletopGMSubscription from './useTabletopGMSubscription'

export const meta: MetaFunction<typeof loader> = ({ data }) => {
	return [
		{ title: data?.campaignName ?? 'Campaign' }
	]
}

export type TabletopGMLoader = ReturnType<typeof useLoaderData<typeof loader>>

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
		maps,
		characters
	] = await Promise.all([
		getCampaignName(loaderOptions),
		getTiles(loaderOptions),
		getMaps(loaderOptions),
		getCharacters(loaderOptions)
	])

	return {
		syncValue: +new Date(),
		campaignId,
		campaignName,
		tiles,
		maps,
		characters
	}
}

export default function Page() {
	useStoreSync()
	useTabletopGMSubscription()

	return (
		<>
			<CombatGridTabletopGM />

			<SettingsPanel />
		</>
	)
}

function useStoreSync() {
	const loaderData = useLoaderData<typeof loader>()
	useMountEffect(() => {
		useTabletopGMStore.getState().syncLoader(loaderData)
	})
}
