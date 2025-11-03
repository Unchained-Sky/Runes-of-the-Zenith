import { createFileRoute, redirect } from '@tanstack/react-router'
import { Fragment } from 'react'
import { safeParseInt } from '~/utils/safeParseInt'
import CombatGridTabletopGM from './-components/CombatGridTabletopGM'
import SettingsPanel from './-components/SettingsPanel'
import { tabletopCurrentEncounterQueryOptions, tabletopEncounterListQueryOptions, tabletopEnemyListQueryOptions, tabletopHeroListQueryOptions, tabletopMapTilesQueryOptions, tabletopNameQueryOptions, tabletopTilesQueryOptions } from './-hooks/useTabletopData'
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
			currentEncounter,
			encounterList,
			heroList,
			enemyList
		] = await Promise.all([
			context.queryClient.ensureQueryData(tabletopNameQueryOptions(campaignId)),
			context.queryClient.ensureQueryData(tabletopTilesQueryOptions(campaignId)),
			context.queryClient.ensureQueryData(tabletopMapTilesQueryOptions(campaignId)),
			context.queryClient.ensureQueryData(tabletopCurrentEncounterQueryOptions(campaignId)),
			context.queryClient.ensureQueryData(tabletopEncounterListQueryOptions(campaignId)),
			context.queryClient.ensureQueryData(tabletopHeroListQueryOptions(campaignId)),
			context.queryClient.ensureQueryData(tabletopEnemyListQueryOptions(campaignId))
		])

		return {
			campaignId,
			campaignName,
			tiles,
			mapTiles,
			currentEncounter,
			encounterList,
			heroList,
			enemyList
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
