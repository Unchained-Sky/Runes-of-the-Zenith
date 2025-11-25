import { useMutation } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { type } from 'arktype'
import { getServiceClient } from '~/supabase/getServiceClient'
import { requireGM } from '~/supabase/requireGM'
import { typedObject } from '~/types/typedObject'
import { mutationError } from '~/utils/mutationError'
import { type TabletopTile, type TabletopTiles } from '../-hooks/tabletopData/useTabletopTiles'

export function useMoveCharacter() {
	const routeApi = getRouteApi('/tabletop/$campaignId/gm/')
	const { queryClient } = routeApi.useRouteContext()
	const { campaignId } = routeApi.useLoaderData()

	return useMutation({
		mutationFn: moveCharacterAction,
		onMutate: ({ data }) => {
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
		},
		onError: error => {
			mutationError(error, 'Failed to move character')
		}
	})
}

const moveCharacterActionSchema = type({
	cord: ['number', 'number', 'number'],
	tabletopCharacterId: 'number',
	characterType: '"HERO" | "ENEMY"'
})

export const moveCharacterAction = createServerFn({ method: 'POST' })
	.validator(moveCharacterActionSchema)
	.handler(async ({ data: { cord: [q, r, s], tabletopCharacterId } }) => {
		const { supabase, campaignId } = await requireGM({ tabletopCharacterId })

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
