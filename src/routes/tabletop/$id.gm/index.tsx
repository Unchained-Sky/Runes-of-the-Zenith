import { createFileRoute, redirect } from '@tanstack/react-router'
import { Fragment } from 'react'
import { safeParseInt } from '~/utils/safeParseInt'
import CombatGridTabletopGM from './-components/CombatGridTabletopGM'
import SettingsPanel from './-components/SettingsPanel'
import { tabletopCharactersQueryOptions, tabletopMapsQueryOptions, tabletopNameQueryOptions, tabletopTilesQueryOptions } from './-hooks/-useTabletopData'
import useTabletopGMSubscription from './-hooks/useTabletopGMSubscription'

export const Route = createFileRoute('/tabletop/$id/gm/')({
	component: RouteComponent,
	loader: async ({ params: { id }, context }) => {
		const campaignId = safeParseInt(id)
		if (!campaignId) throw redirect({ to: '/campaign' })

		const [
			campaignName,
			tiles,
			maps,
			characters
		] = await Promise.all([
			context.queryClient.ensureQueryData(tabletopNameQueryOptions(campaignId)),
			context.queryClient.ensureQueryData(tabletopTilesQueryOptions(campaignId)),
			context.queryClient.ensureQueryData(tabletopMapsQueryOptions()),
			context.queryClient.ensureQueryData(tabletopCharactersQueryOptions(campaignId))
		])

		return {
			campaignId,
			campaignName,
			tiles,
			maps,
			characters
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
