import { createFileRoute, redirect } from '@tanstack/react-router'
import { tokenQueryOptions } from '~/hooks/data/useTokenQuery'
import { safeParseInt } from '~/utils/safeParseInt'
import CombatGridTabletopGM from './-components/CombatGridTabletopGM'
import DragDrop from './-components/DragDrop'
import SettingsPanel from './-components/SettingsPanel'
import Windows from './-components/Windows'
import { tabletopCurrentEncounterQueryOptions } from './-hooks/tabletopData/useTabletopCurrentEncounter'
import { tabletopEncounterListQueryOptions } from './-hooks/tabletopData/useTabletopEncounterList'
import { tabletopEnemyListQueryOptions } from './-hooks/tabletopData/useTabletopEnemyList'
import { tabletopHeroListQueryOptions } from './-hooks/tabletopData/useTabletopHeroList'
import { tabletopHeroRoundsQueryOptions } from './-hooks/tabletopData/useTabletopHeroRounds'
import { tabletopMapTilesQueryOptions } from './-hooks/tabletopData/useTabletopMapTiles'
import { tabletopNameQueryOptions } from './-hooks/tabletopData/useTabletopName'
import { tabletopRoundQueryOptions } from './-hooks/tabletopData/useTabletopRound'
import { tabletopTilesQueryOptions } from './-hooks/tabletopData/useTabletopTiles'
import useTabletopGMSubscription from './-hooks/useTabletopSubscription'

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
			enemyList,
			heroRounds,
			round,
			tokens
		] = await Promise.all([
			context.queryClient.ensureQueryData(tabletopNameQueryOptions(campaignId)),
			context.queryClient.ensureQueryData(tabletopTilesQueryOptions(campaignId)),
			context.queryClient.ensureQueryData(tabletopMapTilesQueryOptions(campaignId)),
			context.queryClient.ensureQueryData(tabletopCurrentEncounterQueryOptions(campaignId)),
			context.queryClient.ensureQueryData(tabletopEncounterListQueryOptions(campaignId)),
			context.queryClient.ensureQueryData(tabletopHeroListQueryOptions(campaignId)),
			context.queryClient.ensureQueryData(tabletopEnemyListQueryOptions(campaignId)),
			context.queryClient.ensureQueryData(tabletopHeroRoundsQueryOptions(campaignId)),
			context.queryClient.ensureQueryData(tabletopRoundQueryOptions(campaignId)),
			context.queryClient.ensureQueryData(tokenQueryOptions)
		])

		return {
			campaignId,
			campaignName,
			tiles,
			mapTiles,
			currentEncounter,
			encounterList,
			heroList,
			enemyList,
			heroRounds,
			round,
			tokens
		}
	},
	head: ({ loaderData }) => ({
		meta: loaderData ? [{ title: loaderData.campaignName }] : undefined
	})
})

function RouteComponent() {
	useTabletopGMSubscription()

	return (
		<DragDrop>
			<CombatGridTabletopGM />
			<SettingsPanel />
			<Windows />
		</DragDrop>
	)
}
