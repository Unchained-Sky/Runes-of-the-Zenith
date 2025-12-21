import { queryOptions, useQueries } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { type } from 'arktype'
import { requireAccount } from '~/supabase/requireAccount'
import { typedObject } from '~/types/typedObject'
import { useTabletopHeroList } from './useTabletopHeroList'

const heroLoaderSchema = type({
	tabletopCharacterId: 'number'
})

const heroLoader = createServerFn({ method: 'GET' })
	.validator(heroLoaderSchema)
	.handler(async ({ data: { tabletopCharacterId } }) => {
		const { supabase } = await requireAccount({ backlink: '/campaigns' })

		const { data, error } = await supabase
			.from('tabletop_characters')
			.select(`
				tabletopHero: tabletop_heroes (
					heroId: hero_id,
					heroInfo: hero_info (
						heroName: hero_name,
						characterInfo: character_info (
							maxHealth: max_health,
							maxShield: max_shield,
							int,
							str,
							dex,
							maxMovement: max_movement,
							critChance: crit_chance
						)
					)
				),
				health,
				wounds,
				shield,
				trauma,
				movement
			`)
			.eq('tt_character_id', tabletopCharacterId)
			.limit(1)
			.maybeSingle()
		if (error) throw new Error(error.message, { cause: error })
		if (!data) return null

		const tabletopHero = data.tabletopHero[0]
		if (!tabletopHero) throw new Error('Hero not found')

		return {
			tabletopCharacterId,
			heroId: tabletopHero.heroId,
			heroName: tabletopHero.heroInfo.heroName,
			stats: tabletopHero.heroInfo.characterInfo,
			tabletopStats: {
				health: data.health,
				wounds: data.wounds,
				shield: data.shield,
				trauma: data.trauma,
				movement: data.movement
			}
		}
	})

const tabletopHeroQueryOptions = (campaignId: number, tabletopCharacterId: number) => queryOptions({
	queryKey: [campaignId, 'tabletop', 'hero', tabletopCharacterId],
	queryFn: () => heroLoader({ data: { tabletopCharacterId } })
})

export type TabletopHeroData = NonNullable<Awaited<ReturnType<typeof heroLoader>>>
type TabletopHeroesData = {
	[tabletopCharacterId: number]: TabletopHeroData
}

export function useTabletopHeroes() {
	const { campaignId } = getRouteApi('/tabletop/$campaignId/gm/').useLoaderData()
	const { data: heroList } = useTabletopHeroList()
	const queries = useQueries({
		queries: heroList.flatMap(hero => hero.tabletopCharacterId ? tabletopHeroQueryOptions(campaignId, hero.tabletopCharacterId) : [])
	})

	const dataTuple = queries
		.map<[number, TabletopHeroesData[number]] | null>(hero => hero.data ? [hero.data.tabletopCharacterId, hero.data] : null)
		.filter(hero => hero !== null)
	const combine: TabletopHeroesData = typedObject.fromEntries(dataTuple)

	return {
		data: combine,
		queries
	}
}
