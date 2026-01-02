import { queryOptions, useQueries } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { type } from 'arktype'
import { type Enums } from '~/supabase/databaseTypes'
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
						),
						heroRune: hero_rune (
							runeInfo: rune_info (
								name: rune_name,
								slot,
								durability,
								damageType: damage_type,
								archetype,
								subarchetype,
								data
							)
						)
					)
				),
				tile: tabletop_tiles (
					q,
					r,
					s
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

		const runes = tabletopHero.heroInfo.heroRune.reduce<Record<InternalTabletopHeroRuneData['slot'], InternalTabletopHeroRuneData[]>>((acc, curr) => {
			const runeData = curr.runeInfo
			runeData.data = JSON.stringify(runeData.data)
			return {
				...acc,
				[runeData.slot]: [
					...acc[runeData.slot],
					runeData
				]
			}
		}, {
			PRIMARY: [],
			SECONDARY: [],
			PASSIVE: []
		})

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
			},
			pos: data.tile[0] ? [data.tile[0].q, data.tile[0].r, data.tile[0].s] : null,
			runes
		}
	})

const tabletopHeroQueryOptions = (campaignId: number, tabletopCharacterId: number) => queryOptions({
	queryKey: [campaignId, 'tabletop', 'hero', tabletopCharacterId],
	queryFn: () => heroLoader({ data: { tabletopCharacterId } })
})

type InternalTabletopHeroData = NonNullable<Awaited<ReturnType<typeof heroLoader>>>
export type TabletopHeroData = Omit<InternalTabletopHeroData, 'runes'> & {
	runes: {
		PRIMARY: TabletopHeroRuneData[]
		SECONDARY: TabletopHeroRuneData[]
		PASSIVE: TabletopHeroRuneData[]
	}
}
type TabletopHeroesData = {
	[tabletopCharacterId: number]: TabletopHeroData
}

type InternalTabletopHeroRuneData = Omit<TabletopHeroRuneData, 'data'> & {
	data: string
}
export type TabletopHeroRuneData = {
	name: string
	slot: Enums<'rune_slot'>
	durability: Enums<'rune_durability'> | null
	damageType: Enums<'damage_type'>
	archetype: string
	subarchetype: string
	data: RuneExtraData
}

const runeExtraDataSchema = type({
	description: 'string'
})
export type RuneExtraData = typeof runeExtraDataSchema.infer
const runeExtraDataFormatter = (rune: InternalTabletopHeroRuneData) => {
	const json = JSON.parse(rune.data)
	const out = runeExtraDataSchema(json)
	if (out instanceof type.errors) {
		throw console.error(out.summary)
	} else {
		return {
			...rune,
			data: out
		}
	}
}

export function useTabletopHeroes() {
	const { campaignId } = getRouteApi('/tabletop/$campaignId/gm/').useLoaderData()
	const { data: heroList } = useTabletopHeroList()
	const queries = useQueries({
		queries: heroList.flatMap(hero => hero.tabletopCharacterId ? tabletopHeroQueryOptions(campaignId, hero.tabletopCharacterId) : [])
	})

	const dataTuple = queries
		.map<[number, TabletopHeroData] | null>(hero => {
			if (!hero.data) return null

			const runeExtraData = {
				PRIMARY: hero.data.runes.PRIMARY.map(runeExtraDataFormatter),
				SECONDARY: hero.data.runes.SECONDARY.map(runeExtraDataFormatter),
				PASSIVE: hero.data.runes.PASSIVE.map(runeExtraDataFormatter)
			}

			return [hero.data.tabletopCharacterId, {
				...hero.data,
				runes: runeExtraData
			}]
		})
		.filter(hero => hero !== null)
	const combine: TabletopHeroesData = typedObject.fromEntries(dataTuple)

	return {
		data: combine,
		queries
	}
}
