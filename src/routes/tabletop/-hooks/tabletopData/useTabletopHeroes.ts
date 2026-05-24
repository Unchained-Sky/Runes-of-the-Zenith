import { queryOptions, useSuspenseQueries } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { type } from 'arktype'
import { useTabletopContext } from '~/routes/tabletop/-utils/TabletopContext'
import { type RuneData, runeExtraDataSchema } from '~/scripts/data/runes/runeData'
import { type Enums, type Json, type TablesInsert } from '~/supabase/databaseTypes'
import { getServiceClient } from '~/supabase/getServiceClient'
import { requireAccount } from '~/supabase/requireAccount'
import { typedObject } from '~/types/typedObject'
import { lingeringDataFormatter } from '../../-utils/lingeringData'
import { TABLETOP_QUERY_STALE_TIME } from './tabletopDataOptions'
import { useTabletopHeroList } from './useTabletopHeroList'

const heroLoaderSchema = type({
	tabletopCharacterId: 'number'
})

const heroLoader = createServerFn({ method: 'GET' })
	.inputValidator(heroLoaderSchema)
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
				movement,
				turn: tabletop_hero_turn (
					turnType: turn_type,
					used,
					order
				),
				token: tabletop_character_token (
					name: token_name,
					amount
				),
				lingering: tabletop_lingering (
					lingeringId: linger_id,
					decrementTime: decrement_time,
					remainingTime: remaining_time,
					data
				)
			`)
			.eq('tt_character_id', tabletopCharacterId)
			.limit(1)
			.maybeSingle()
		if (error) throw new Error(error.message, { cause: error })
		if (!data) return null

		const tabletopHero = data.tabletopHero[0]
		if (!tabletopHero) throw new Error('Hero not found')

		const runes = tabletopHero.heroInfo.heroRune
			.map(runeExtraDataFormatter)
			.reduce<Record<RuneData['slot'], RuneData[]>>((acc, curr) => {
				return {
					...acc,
					[curr.slot]: [
						...acc[curr.slot],
						curr
					]
				}
			}, {
				PRIMARY: [],
				SECONDARY: [],
				PASSIVE: []
			})

		const getAvatar = async (heroId: number) => {
			const { data } = await supabase
				.storage
				.from('hero_avatar')
				.exists(`${heroId}.png`)

			const { data: { publicUrl: avatarUrl } } = supabase
				.storage
				.from('hero_avatar')
				.getPublicUrl(`${data ? heroId : 'default'}.png`)
			return avatarUrl
		}
		const avatarUrl = await getAvatar(tabletopHero.heroId)

		const isPrimaryTurn = (turn: HeroTurnFallback): turn is HeroTurn & { turnType: 'PRIMARY' } => {
			return turn.turnType === 'PRIMARY'
		}
		const isSecondaryTurn = (turn: HeroTurnFallback): turn is HeroTurn & { turnType: 'SECONDARY' } => {
			return turn.turnType === 'SECONDARY'
		}
		const primaryTurn = data.turn.find(isPrimaryTurn)
		const secondaryTurn = data.turn.find(isSecondaryTurn)
		let turn = primaryTurn && secondaryTurn ? { PRIMARY: primaryTurn, SECONDARY: secondaryTurn } : null
		if (!turn) {
			const serviceClient = getServiceClient()
			const { error } = await serviceClient
				.from('tabletop_hero_turn')
				.insert([
					{
						tt_character_id: tabletopCharacterId,
						turn_type: 'PRIMARY',
						used: false,
						order: null
					},
					{
						tt_character_id: tabletopCharacterId,
						turn_type: 'SECONDARY',
						used: false,
						order: null
					}
				] satisfies TablesInsert<'tabletop_hero_turn'>[])
			if (error) throw new Error(error.message, { cause: error })

			turn = {
				PRIMARY: {
					turnType: 'PRIMARY',
					used: false,
					order: null
				},
				SECONDARY: {
					turnType: 'SECONDARY',
					used: false,
					order: null
				}
			}
		}

		const lingering = data.lingering.map(lingeringDataFormatter)

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
			runes,
			avatarUrl,
			turn,
			tokens: data.token,
			lingering
		}
	})

const tabletopHeroQueryOptions = (campaignId: number, tabletopCharacterId: number) => queryOptions({
	queryKey: [campaignId, 'tabletop', 'hero', tabletopCharacterId],
	queryFn: () => heroLoader({ data: { tabletopCharacterId } }),
	staleTime: TABLETOP_QUERY_STALE_TIME
})

type InternalTabletopHeroData = NonNullable<Awaited<ReturnType<typeof heroLoader>>>
export type TabletopHeroData = Omit<InternalTabletopHeroData, 'runes'> & {
	runes: {
		PRIMARY: RuneData[]
		SECONDARY: RuneData[]
		PASSIVE: RuneData[]
	}
}

type InternalTabletopHeroRuneData = {
	runeInfo: Omit<RuneData, 'data'> & { data: Json }
}

const runeExtraDataFormatter = (rune: InternalTabletopHeroRuneData) => {
	const out = runeExtraDataSchema(rune.runeInfo.data)
	if (out instanceof type.errors) {
		throw console.error(out.summary)
	} else {
		return {
			...rune.runeInfo,
			effect: out
		}
	}
}

export type HeroTurn = UsedHeroTurn | UnusedHeroTurn

type HeroTurnFallback = {
	turnType: Enums<'turn_type'>
	used: boolean
	order: number | null
}

interface UsedHeroTurn extends HeroTurnFallback {
	used: true
	order: number
}

interface UnusedHeroTurn extends HeroTurnFallback {
	used: false
	order: null
}

export function useTabletopHeroes() {
	const { campaignId } = useTabletopContext()
	const { data: heroList } = useTabletopHeroList()

	const queries = useSuspenseQueries({
		queries: heroList.flatMap(hero => hero.tabletopCharacterId
			? tabletopHeroQueryOptions(campaignId, hero.tabletopCharacterId)
			: [])
	})

	const dataTuple = queries
		.map<[number, TabletopHeroData] | null>(hero => {
			if (!hero.data) return null
			return [
				hero.data.tabletopCharacterId,
				{ ...hero.data }
			]
		})
		.filter(hero => hero !== null)

	const combine: { [tabletopCharacterId: number]: TabletopHeroData } = typedObject.fromEntries(dataTuple)

	return {
		data: combine,
		queries
	}
}
