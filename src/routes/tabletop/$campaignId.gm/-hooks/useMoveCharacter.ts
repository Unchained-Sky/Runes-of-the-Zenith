import { notifications } from '@mantine/notifications'
import { useMutation } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { type } from 'arktype'
import { getServiceClient } from '~/supabase/getServiceClient'
import { requireAccount } from '~/supabase/requireAccount'
import { typedObject } from '~/types/typedObject'
import { type TabletopTile, type TabletopTiles } from './tabletopData/useTabletopTiles'

export default function useMoveCharacter() {
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
			notifications.show({
				title: 'Failed to move character',
				color: 'red',
				message: error.message
			})
		}
	})
}

const moveCharacterActionSchema = type({
	cord: ['number', 'number', 'number'],
	tabletopCharacterId: 'number',
	characterType: '"HERO" | "ENEMY"'
})

const moveCharacterAction = createServerFn({ method: 'POST' })
	.validator(moveCharacterActionSchema)
	.handler(async ({ data: { cord: [q, r, s], tabletopCharacterId } }) => {
		const { supabase, user } = await requireAccount()

		// Check if the user is the GM
		const { data, error } = await supabase
			.from('tabletop_characters')
			.select(`
				campaignId: campaign_id,
				campaign_info (
					gmUserId: user_id
				)
			`)
			.eq('tt_character_id', tabletopCharacterId)
			.limit(1)
			.single()
		if (error)	throw new Error(error.message, { cause: error })
		if (data.campaign_info.gmUserId !== user.id) throw new Error('You are not the GM of this campaign')

		const { campaignId } = data

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
