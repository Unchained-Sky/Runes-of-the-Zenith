import { createFileRoute, redirect } from '@tanstack/react-router'
import { tokenQueryOptions } from '~/hooks/data/useTokenQuery'
import { TabletopContext } from '~/routes/tabletop/-utils/TabletopContext'
import DragDrop from '~/tt/-components/DragDrop'
import { tabletopEnemyListQueryOptions } from '~/tt/-hooks/tabletopData/useTabletopEnemyList'
import { tabletopHeroListQueryOptions } from '~/tt/-hooks/tabletopData/useTabletopHeroList'
import { tabletopHeroRoundsQueryOptions } from '~/tt/-hooks/tabletopData/useTabletopHeroRounds'
import { tabletopMapTilesQueryOptions } from '~/tt/-hooks/tabletopData/useTabletopMapTiles'
import { tabletopNameQueryOptions } from '~/tt/-hooks/tabletopData/useTabletopName'
import { tabletopRoundQueryOptions } from '~/tt/-hooks/tabletopData/useTabletopRound'
import { tabletopTilesQueryOptions } from '~/tt/-hooks/tabletopData/useTabletopTiles'
import Windows from '~/tt/-windows'
import { safeParseInt } from '~/utils/safeParseInt'
import CombatGridTabletopPlayer from './-components/CombatGridTabletopPlayer'
import Sidebar from './-components/Sidebar'

export const Route = createFileRoute('/tabletop/$campaignId/player/')({
	component: RouteComponent,
	loader: async ({ params: { campaignId: campaignIdString }, context }) => {
		const campaignId = safeParseInt(campaignIdString)
		if (!campaignId) throw redirect({ to: '/campaign' })

		const [
			campaignName,
			tiles,
			mapTiles,
			heroList,
			enemyList,
			heroRounds,
			round,
			tokens
		] = await Promise.all([
			context.queryClient.ensureQueryData(tabletopNameQueryOptions(campaignId)),
			context.queryClient.ensureQueryData(tabletopTilesQueryOptions(campaignId)),
			context.queryClient.ensureQueryData(tabletopMapTilesQueryOptions(campaignId)),
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
	const { campaignId } = Route.useLoaderData()
	const { queryClient } = Route.useRouteContext()

	return (
		<TabletopContext
			value={{
				campaignId,
				queryClient,
				role: 'player',
				route: '/tabletop/$campaignId/player/'
			}}
		>
			<DragDrop>
				<CombatGridTabletopPlayer />
				<Sidebar />
				<Windows />
			</DragDrop>
		</TabletopContext>
	)
}
