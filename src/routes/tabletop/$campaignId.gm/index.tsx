import { createFileRoute, redirect } from '@tanstack/react-router'
import { Fragment } from 'react'
import { safeParseInt } from '~/utils/safeParseInt'
import CombatGridTabletopGM from './-components/CombatGridTabletopGM'
import SettingsPanel from './-components/SettingsPanel'
import { tabletopHeroesQueryOptions, tabletopMapsQueryOptions, tabletopNameQueryOptions, tabletopTilesQueryOptions } from './-hooks/-useTabletopData'
import useTabletopGMSubscription from './-hooks/useTabletopGMSubscription'

export const Route = createFileRoute('/tabletop/$campaignId/gm/')({
	component: RouteComponent,
	loader: async ({ params: { campaignId: campaignIdString }, context }) => {
		const campaignId = safeParseInt(campaignIdString)
		if (!campaignId) throw redirect({ to: '/campaign' })

		const [
			campaignName,
			tiles,
			maps,
			heroes
		] = await Promise.all([
			context.queryClient.ensureQueryData(tabletopNameQueryOptions(campaignId)),
			context.queryClient.ensureQueryData(tabletopTilesQueryOptions(campaignId)),
			context.queryClient.ensureQueryData(tabletopMapsQueryOptions()),
			context.queryClient.ensureQueryData(tabletopHeroesQueryOptions(campaignId))
		])

		return {
			campaignId,
			campaignName,
			tiles,
			maps,
			heroes
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
