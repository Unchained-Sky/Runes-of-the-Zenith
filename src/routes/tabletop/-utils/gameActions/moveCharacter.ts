import { useMutation } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { type } from 'arktype'
import { useTabletopContext } from '~/routes/tabletop/-utils/TabletopContext'
import { getServiceClient } from '~/supabase/getServiceClient'
import { type TabletopGMEnemyData } from '~/tt-gm/-hooks/tabletopData/useTabletopEnemies'
import { type TabletopHeroData } from '~/tt/-hooks/tabletopData/useTabletopHeroes'
import { type TabletopTile, type TabletopTiles } from '~/tt/-hooks/tabletopData/useTabletopTiles'
import { characterType } from '~/types/gameTypes/character'
import { typedObject } from '~/types/typedObject'
import { mutationError } from '~/utils/mutationError'
import { hasCharacterPermission } from '../characterPermission'
import { type QuerySyncProps } from './querySync'

export function useMoveCharacter() {
	const { queryClient, campaignId } = useTabletopContext()

	return useMutation({
		mutationFn: moveCharacterAction,
		scope: {
			id: 'tabletop-move-character'
		},
		onMutate: ({ data }) => {
			moveCharacterQuerySync({ queryClient, campaignId, data })
		},
		onError: error => {
			mutationError(error, 'Failed to move character')
		}
	})
}

type MoveCharacterQuerySyncProps = QuerySyncProps<typeof moveCharacterSchema>

export function moveCharacterQuerySync({ queryClient, campaignId, data }: MoveCharacterQuerySyncProps) {
	void queryClient.cancelQueries({ queryKey: [campaignId, 'tabletop', 'tiles', 'characters'] })
	queryClient.setQueryData([campaignId, 'tabletop', 'tiles', 'characters'], (oldData: TabletopTiles) => {
		const cord = `${data.cord[0]},${data.cord[1]},${data.cord[2]}` as const
		const [oldCord] = typedObject.entries(oldData).find(([_keys, value]) => value?.tabletopCharacterId === data.tabletopCharacterId) ?? []
		const out: TabletopTiles = {
			...oldData,
			[cord]: {
				tabletopCharacterId: data.tabletopCharacterId,
				characterType: data.characterType
			} satisfies TabletopTile
		}
		if (oldCord) {
			out[oldCord] = null
		}
		return out
	})

	switch (data.characterType) {
		case 'HERO': {
			void queryClient.cancelQueries({ queryKey: [campaignId, 'tabletop', 'hero', data.tabletopCharacterId] })
			queryClient.setQueriesData({ queryKey: [campaignId, 'tabletop', 'hero', data.tabletopCharacterId] }, (oldData: TabletopHeroData) => ({
				...oldData,
				pos: data.cord
			} satisfies TabletopHeroData))
			break
		}
		case 'ENEMY': {
			void queryClient.cancelQueries({ queryKey: [campaignId, 'tabletop', 'enemy', data.tabletopCharacterId] })
			queryClient.setQueriesData({ queryKey: [campaignId, 'tabletop', 'enemy', data.tabletopCharacterId] }, (oldData: TabletopGMEnemyData) => ({
				...oldData,
				pos: data.cord
			} satisfies TabletopGMEnemyData))
			break
		}
	}
}

const moveCharacterSchema = type({
	cord: ['number', 'number', 'number'],
	tabletopCharacterId: 'number',
	characterType
})

export const moveCharacterAction = createServerFn({ method: 'POST' })
	.inputValidator(moveCharacterSchema)
	.handler(async ({ data: { cord: [q, r, s], tabletopCharacterId } }) => {
		const { supabase, campaignId } = await hasCharacterPermission({ tabletopCharacterId })

		{
			// Check if a character is already on the tile
			const { data, error } = await supabase
				.from('tabletop_tiles')
				.select('tabletopCharacterId: tt_character_id')
				.eq('campaign_id', campaignId)
				.eq('q', q)
				.eq('r', r)
				.eq('s', s)
				.limit(1)
				.maybeSingle()
			if (error) throw new Error(error.message, { cause: error })
			if (data?.tabletopCharacterId) throw new Error('The tile is already occupied')
		}

		const serviceClient = getServiceClient()

		{
			// Remove from old tile
			const { error } = await serviceClient
				.from('tabletop_tiles')
				.update({
					tt_character_id: null
				})
				.eq('campaign_id', campaignId)
				.eq('tt_character_id', tabletopCharacterId)
			if (error) throw new Error(error.message, { cause: error })
		}

		{
			// Move the character
			const { error } = await serviceClient
				.from('tabletop_tiles')
				.upsert({
					tt_character_id: tabletopCharacterId,
					campaign_id: campaignId,
					q,
					r,
					s
				})
				.eq('campaign_id', campaignId)
				.eq('q', q)
				.eq('r', r)
				.eq('s', s)
			if (error) throw new Error(error.message, { cause: error })
		}
	})
