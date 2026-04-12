import { queryOptions, useSuspenseQueries, type UseSuspenseQueryResult } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { type } from 'arktype'
import { useState } from 'react'
import useMountEffect from '~/hooks/useMountEffect'
import { type RuneData, runeExtraDataSchema } from '~/scripts/data/runes/runeData'
import { type Enums } from '~/supabase/databaseTypes'
import { requireAccount } from '~/supabase/requireAccount'
import { useSupabase } from '~/supabase/useSupabase'
import { typedObject } from '~/types/typedObject'
import { TABLETOP_QUERY_STALE_TIME } from './tabletopDataOptions'
import { useGMTabletopHeroList } from './useTabletopHeroList'

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
				movement,
				turn: tabletop_hero_turn (
					turnType: turn_type,
					used,
					order
				),
				token: tabletop_character_token (
					name: token_name,
					amount
				)
			`)
			.eq('tt_character_id', tabletopCharacterId)
			.limit(1)
			.maybeSingle()
		if (error) throw new Error(error.message, { cause: error })
		if (!data) return null

		const tabletopHero = data.tabletopHero[0]
		if (!tabletopHero) throw new Error('Hero not found')

		const runes = tabletopHero.heroInfo.heroRune.reduce<Record<RuneData['slot'], InternalTabletopHeroRuneData[]>>((acc, curr) => {
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

		const isPrimaryTurn = (turn: Turn): turn is Turn & { turnType: 'PRIMARY' } => {
			return turn.turnType === 'PRIMARY'
		}
		const isSecondaryTurn = (turn: Turn): turn is Turn & { turnType: 'SECONDARY' } => {
			return turn.turnType === 'SECONDARY'
		}
		const primaryTurn = data.turn.find(isPrimaryTurn)
		const secondaryTurn = data.turn.find(isSecondaryTurn)
		const turn = primaryTurn && secondaryTurn ? { PRIMARY: primaryTurn, SECONDARY: secondaryTurn } : null

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
			tokens: data.token
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

type InternalTabletopHeroRuneData = Omit<RuneData, 'data'> & { data: string }

const runeExtraDataFormatter = (rune: InternalTabletopHeroRuneData) => {
	const json = JSON.parse(rune.data)
	const out = runeExtraDataSchema(json)
	if (out instanceof type.errors) {
		throw console.error(out.summary)
	} else {
		return {
			...rune,
			data: out
		} as RuneData
	}
}

type Turn = {
	turnType: Enums<'turn_type'>
	used: boolean
	order: number | null
}

function combineHeroData(queries: UseSuspenseQueryResult<InternalTabletopHeroData | null>[]) {
	const dataTuple = queries
		.map<[number, TabletopHeroData] | null>(hero => {
			if (!hero.data) return null

			const runeExtraData = {
				PRIMARY: hero.data.runes.PRIMARY.map(runeExtraDataFormatter),
				SECONDARY: hero.data.runes.SECONDARY.map(runeExtraDataFormatter),
				PASSIVE: hero.data.runes.PASSIVE.map(runeExtraDataFormatter)
			}

			return [
				hero.data.tabletopCharacterId,
				{ ...hero.data, runes: runeExtraData }
			]
		})
		.filter(hero => hero !== null)

	const combine: { [tabletopCharacterId: number]: TabletopHeroData } = typedObject.fromEntries(dataTuple)
	return combine
}

export function useGMTabletopHeroes() {
	const { campaignId } = getRouteApi('/tabletop/$campaignId/gm/').useLoaderData()
	const { data: heroList } = useGMTabletopHeroList()

	const queries = useSuspenseQueries({
		queries: heroList.flatMap(hero => hero.tabletopCharacterId ? tabletopHeroQueryOptions(campaignId, hero.tabletopCharacterId) : [])
	})

	return {
		data: combineHeroData(queries),
		queries
	}
}

export function usePlayerTabletopHeroes() {
	const { campaignId } = getRouteApi('/tabletop/$campaignId/player/').useLoaderData()
	const { data: heroList } = useGMTabletopHeroList()

	const supabase = useSupabase()
	const [userId, setUserId] = useState<string | null>(null)

	useMountEffect(() => {
		async function getUserId() {
			const { data, error } = await supabase.auth.getUser()
			if (error) throw new Error(error.message, { cause: error })
			setUserId(data.user.id)
		}
		getUserId().catch(console.error)
	})

	const queries = useSuspenseQueries({
		queries: userId
			? heroList.flatMap(hero => hero.tabletopCharacterId && hero.userId === userId
				? tabletopHeroQueryOptions(campaignId, hero.tabletopCharacterId)
				: [])
			: []
	})

	return {
		data: combineHeroData(queries),
		queries
	}
}
