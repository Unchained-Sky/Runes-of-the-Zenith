import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { type } from 'arktype'
import { adminUUID } from '~/supabase/adminAccount'
import { requireAccount } from '~/supabase/requireAccount'

const encounterListLoaderSchema = type({
	campaignId: 'number'
})

const encounterListLoader = createServerFn({ method: 'GET' })
	.validator(encounterListLoaderSchema)
	.handler(async ({ data: { campaignId } }) => {
		const { supabase, user } = await requireAccount({ backlink: '/campaigns' })

		const tabletopInfo = await supabase
			.from('tabletop_info')
			.select('encounter_id')
			.eq('campaign_id', campaignId)
			.limit(1)
			.maybeSingle()
		if (tabletopInfo.error) throw new Error(tabletopInfo.error.message, { cause: tabletopInfo.error })

		if (!tabletopInfo.data) {
			const { error } = await supabase
				.from('tabletop_info')
				.insert({ campaign_id: campaignId })
			if (error) throw new Error(error.message, { cause: error })
		}

		const compendiumEncounters = await supabase
			.from('encounter_info')
			.select(`
				encounterId: encounter_id,
				encounterName: encounter_name
			`)
			.eq('user_id', adminUUID)
		if (compendiumEncounters.error) throw new Error(compendiumEncounters.error.message, { cause: compendiumEncounters.error })

		const homebrewEncounters = await supabase
			.from('encounter_info')
			.select(`
				encounterId: encounter_id,
				encounterName: encounter_name,
				mapInfo: map_info (
					mapCombatTileCount: map_combat_tile(count)
				)
			`)
			.eq('user_id', user.id)
		if (homebrewEncounters.error) throw new Error(homebrewEncounters.error.message, { cause: homebrewEncounters.error })

		return {
			compendium: compendiumEncounters.data,
			homebrew: homebrewEncounters.data
				.filter(encounter => encounter.mapInfo.mapCombatTileCount[0]?.count)
				.map(encounter => ({
					encounterId: encounter.encounterId,
					encounterName: encounter.encounterName
				}))
		}
	})

export const tabletopEncounterListQueryOptions = (campaignId: number) => queryOptions({
	queryKey: [campaignId, 'tabletop', 'encounters'],
	queryFn: () => encounterListLoader({ data: { campaignId } })
})

export function useTabletopEncounterList() {
	const { campaignId } = getRouteApi('/tabletop/$campaignId/gm/').useLoaderData()
	return useSuspenseQuery(tabletopEncounterListQueryOptions(campaignId))
}
