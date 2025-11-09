import { queryOptions, useSuspenseQueries } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { type } from 'arktype'
import { requireAccount } from '~/supabase/requireAccount'
import { useTabletopHeroList } from './useTabletopHeroList'

const heroLoaderSchema = type({
	heroId: 'number'
})

const heroLoader = createServerFn({ method: 'GET' })
	.validator(heroLoaderSchema)
	.handler(async ({ data: { heroId } }) => {
		const { supabase } = await requireAccount({ backlink: '/campaigns' })

		const { data, error } = await supabase
			.from('hero_info')
			.select(`
				heroName: hero_name,
				tabletopHero: tabletop_heroes (
					tabletopCharacterId: tt_character_id
				)
			`)
			.eq('hero_id', heroId)
			.limit(1)
			.single()
		if (error) throw new Error(error.message, { cause: error })

		return {
			heroId,
			heroName: data.heroName,
			tabletopCharacter: data.tabletopHero
				? {
					tabletopCharacterId: data.tabletopHero.tabletopCharacterId
				}
				: null
		}
	})

const tabletopHeroQueryOptions = (campaignId: number, heroId: number) => queryOptions({
	queryKey: [campaignId, 'tabletop', 'hero', heroId],
	queryFn: () => heroLoader({ data: { heroId } })
})

export type HeroData = Awaited<ReturnType<typeof heroLoader>>
interface HeroDataTabletop extends HeroData {
	tabletopCharacter: NonNullable<HeroData['tabletopCharacter']>
}

class HeroDataMap {
	#map: Map<`hero-${number}` | `character-${number}`, HeroData>
	// set of heroIds that don't have tabletop characters
	#inactive: Set<number>

	constructor(data: { data: HeroData }[]) {
		this.#map = new Map()
		this.#inactive = new Set()
		data.forEach(({ data }) => this.#set(data.heroId, data.tabletopCharacter?.tabletopCharacterId, data))
	}

	#set(heroId: number, tabletopCharacterId: number | undefined, value: HeroData) {
		this.#map.set(`hero-${heroId}`, value)
		if (tabletopCharacterId) {
			this.#map.set(`character-${tabletopCharacterId}`, value)
		} else {
			this.#inactive.add(heroId)
		}
	}

	getFromHeroId(heroId: number) {
		const heroData = this.#map.get(`hero-${heroId}`)
		if (!heroData) throw new Error(`Hero not found: ${heroId}`)
		return heroData
	}

	getFromCharacterId(tabletopCharacterId: number) {
		return this.#map.get(`character-${tabletopCharacterId}`) as HeroDataTabletop | undefined
	}

	getAll() {
		return [...this.#map.entries()].flatMap(([key, value]) => key.startsWith('hero-') ? [value] : [])
	}

	getInactive() {
		return [...this.#inactive]
	}
}

export function useTabletopHeroes() {
	const { campaignId } = getRouteApi('/tabletop/$campaignId/gm/').useLoaderData()
	const heroIds = useTabletopHeroList().data
	const queries = useSuspenseQueries({
		queries: heroIds.map(heroId => tabletopHeroQueryOptions(campaignId, heroId))
		// combine doesn't work because it doesn't update when you manually set query data
	})

	return {
		// TODO memoise this somehow
		data: new HeroDataMap(queries),
		queries
	}
}
