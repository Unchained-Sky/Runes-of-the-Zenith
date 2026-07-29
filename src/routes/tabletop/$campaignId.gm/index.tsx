import { createFileRoute, redirect } from '@tanstack/react-router'
import { tokenQueryOptions } from '~/hooks/data/useTokenQuery'
import DragDrop from '~/tt/-components/DragDrop'
import { tabletopEnemyListQueryOptions } from '~/tt/-hooks/tabletopData/useTabletopEnemyList'
import { tabletopHeroListQueryOptions } from '~/tt/-hooks/tabletopData/useTabletopHeroList'
import { tabletopMapTilesQueryOptions } from '~/tt/-hooks/tabletopData/useTabletopMapTiles'
import { tabletopNameQueryOptions } from '~/tt/-hooks/tabletopData/useTabletopName'
import { tabletopRoundQueryOptions } from '~/tt/-hooks/tabletopData/useTabletopRound'
import { tabletopTilesQueryOptions } from '~/tt/-hooks/tabletopData/useTabletopTiles'
import { safeParseInt } from '~/utils/safeParseInt'
import { useTabletopEnvironmentStore } from '../-hooks/useTabletopEnvironmentStore'
import Windows from '../-windows'
import CombatGridTabletopGM from './-components/CombatGridTabletopGM'
import SettingsPanel from './-components/SettingsPanel'
import { tabletopCurrentEncounterQueryOptions } from './-hooks/tabletopData/useGMTabletopCurrentEncounter'
import { tabletopEncounterListQueryOptions } from './-hooks/tabletopData/useGMTabletopEncounterList'
import useTabletopSubscriptions from '../-hooks/useTabletopSubscriptions'

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
			round,
			tokens
		}
	},
	head: ({ loaderData }) => ({
		meta: loaderData ? [{ title: loaderData.campaignName }] : undefined
	})
})

function RouteComponent() {
	const { campaignId } = Route.useLoaderData()
	useTabletopEnvironmentStore(state => state.setup)({
		campaignId,
		role: 'gm',
		route: '/tabletop/$campaignId/gm/'
	})

	useTabletopSubscriptions(campaignId)

	return (
		<DragDrop>
			<Windows />
			<CombatGridTabletopGM />
			<SettingsPanel />
		</DragDrop>
	)
}
