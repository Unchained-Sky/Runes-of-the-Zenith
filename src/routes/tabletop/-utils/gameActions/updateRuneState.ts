import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { type } from 'arktype'
import { type TablesInsert } from '~/supabase/databaseTypes'
import { getServiceClient } from '~/supabase/getServiceClient'
import { mutationError } from '~/utils/mutationError'
import { type TabletopEnemyRuneData, type TabletopGMEnemyData } from '../../$campaignId.gm/-hooks/tabletopData/useGMTabletopEnemies'
import { type TabletopHeroData, type TabletopRuneData } from '../../-hooks/tabletopData/useTabletopHeroes'
import { hasCharacterPermission } from '../characterPermission'
import getQueryKey from '../getQueryKey'
import { type QuerySyncProps } from './querySync'

export function useUpdateRuneState() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: updateRuneStateAction,
		onMutate: ({ data }) => {
			updateRuneStateQuerySync({ queryClient, data })
		},
		onError: error => {
			mutationError(error, 'Failed to update rune state')
		}
	})
}

type UpdateRuneStateQuerySyncProps = QuerySyncProps<typeof updateRuneStateSchema>

function updateRuneStateQuerySync({ queryClient, data }: UpdateRuneStateQuerySyncProps) {
	const { queryKey, characterType } = getQueryKey({ type: 'character', data: { tabletopCharacterId: data.tabletopCharacterId, queryClient } })

	const updatedRunes = data.runes.map(rune => rune.runeName)

	function runeUpdater<T extends TabletopRuneData | TabletopEnemyRuneData>(rune: T): T {
		return updatedRunes.includes(rune.name)
			? {
				...rune,
				currentDurability: data.runes.find(r => r.runeName === rune.name && r.runeState !== rune.durability)?.runeState ?? null
			} satisfies T
			: rune
	}

	switch (characterType) {
		case 'HERO': {
			queryClient.setQueriesData({ queryKey }, (oldData: TabletopHeroData) => {
				const runes = structuredClone(oldData.runes)
				runes.PASSIVE = runes.PASSIVE.map(runeUpdater)
				runes.PRIMARY = runes.PRIMARY.map(runeUpdater)
				runes.SECONDARY = runes.SECONDARY.map(runeUpdater)
				return {
					...oldData,
					runes
				} satisfies TabletopHeroData
			})
			break
		}
		case 'ENEMY': {
			queryClient.setQueriesData({ queryKey }, (oldData: TabletopGMEnemyData) => {
				const runes = structuredClone(oldData.runes)
				runes.PASSIVE = runes.PASSIVE.map(runeUpdater)
				runes.PRIMARY = runes.PRIMARY.map(runeUpdater)
				runes.SECONDARY = runes.SECONDARY.map(runeUpdater)
				return {
					...oldData,
					runes
				} satisfies TabletopGMEnemyData
			})
			break
		}
	}
}

const updateRuneStateSchema = type({
	tabletopCharacterId: 'number',
	runes: type({
		runeName: 'string',
		runeState: '"REINFORCED" | "STABLE" | "UNSTABLE" | "FRAGILE" | "BROKEN" | null'
	}).array()
})

const updateRuneStateAction = createServerFn({ method: 'POST' })
	.inputValidator(updateRuneStateSchema)
	.handler(async ({ data: { tabletopCharacterId, runes } }) => {
		await hasCharacterPermission({ tabletopCharacterId })

		const serviceClient = getServiceClient()

		const { data, error } = await serviceClient
			.from('tabletop_characters')
			.select(`
				characterType: character_type,
				tabletopHero: tabletop_heroes (
					heroId: hero_id
				),
				tabletopEnemy: tabletop_enemy (
					enemyId: enemy_id
				)
			`)
			.eq('tt_character_id', tabletopCharacterId)
			.limit(1)
			.single()
			.overrideTypes<{
				characterType: 'HERO'
				tabletopHero: [{ heroId: number }]
			} | {
				characterType: 'ENEMY'
				tabletopEnemy: { enemyId: number }
			}, { merge: false }>()
		if (error) throw new Error(error.message, { cause: error })
		const characterType = data.characterType

		for (const rune of runes) {
			const runeBaseDurability = await (async () => {
				switch (characterType) {
					case 'HERO': {
						const heroId = data.tabletopHero[0].heroId
						const { data: runeData, error } = await serviceClient
							.from('hero_rune')
							.select(`
								runeInfo: rune_info (
									durability
								)
							`)
							.eq('hero_id', heroId)
							.eq('rune_name', rune.runeName)
							.limit(1)
							.single()
						if (error) throw new Error(error.message, { cause: error })
						return runeData.runeInfo.durability
					}
					case 'ENEMY': {
						const enemyId = data.tabletopEnemy.enemyId
						const { data: runeData, error } = await serviceClient
							.from('enemy_rune_info')
							.select('durability')
							.eq('enemy_id', enemyId)
							.eq('rune_name', rune.runeName)
							.limit(1)
							.single()
						if (error) throw new Error(error.message, { cause: error })
						return runeData.durability
					}
				}
			})()

			if (rune.runeState && rune.runeState !== runeBaseDurability) {
				const { error } = await serviceClient
					.from('tabletop_rune_state')
					.upsert({
						tt_character_id: tabletopCharacterId,
						rune_name: rune.runeName,
						rune_state: rune.runeState
					} satisfies TablesInsert<'tabletop_rune_state'>)
				if (error) throw new Error(error.message, { cause: error })
			} else {
				const { error } = await serviceClient
					.from('tabletop_rune_state')
					.delete()
					.eq('tt_character_id', tabletopCharacterId)
					.eq('rune_name', rune.runeName)
					.limit(1)
				if (error) throw new Error(error.message, { cause: error })
			}
		}
	})
