import { createFileRoute, redirect } from '@tanstack/react-router'
import { Fragment } from 'react'
import { safeParseInt } from '~/utils/safeParseInt'
import CombatGridTabletopGM from './-components/CombatGridTabletopGM'
import SettingsPanel from './-components/SettingsPanel'
import { tabletopHeroListQueryOptions, tabletopMapListQueryOptions, tabletopMapTilesQueryOptions, tabletopNameQueryOptions, tabletopTilesQueryOptions } from './-hooks/useTabletopData'
import useTabletopGMSubscription from './-hooks/useTabletopGMSubscription'

export const Route = createFileRoute('/tabletop/$campaignId/gm/')({
	component: RouteComponent,
	loader: async ({ params: { campaignId: campaignIdString }, context }) => {
		const campaignId = safeParseInt(campaignIdString)
		if (!campaignId) throw redirect({ to: '/campaign' })

		const [
			campaignName,
			tiles,
			mapTiles,
			mapList,
			heroList
		] = await Promise.all([
			context.queryClient.ensureQueryData(tabletopNameQueryOptions(campaignId)),
			context.queryClient.ensureQueryData(tabletopTilesQueryOptions(campaignId)),
			context.queryClient.ensureQueryData(tabletopMapTilesQueryOptions(campaignId)),
			context.queryClient.ensureQueryData(tabletopMapListQueryOptions()),
			context.queryClient.ensureQueryData(tabletopHeroListQueryOptions(campaignId))
		])

		return {
			campaignId,
			campaignName,
			tiles,
			mapTiles,
			mapList,
			heroList
		}
	},
	head: ({ loaderData }) => ({
		meta: loaderData ? [{ title: loaderData.campaignName }] : undefined
	})
})

function RouteComponent() {
	useTabletopGMSubscription()

	return (
		<Fragment>
			<CombatGridTabletopGM />

			<SettingsPanel />
		</Fragment>
	)
}
