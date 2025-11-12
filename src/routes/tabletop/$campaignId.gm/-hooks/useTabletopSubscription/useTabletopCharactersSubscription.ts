import { getRouteApi } from '@tanstack/react-router'
import useMountEffect from '~/hooks/useMountEffect'
import { type Tables } from '~/supabase/databaseTypes'
import { typedObject } from '~/types/typedObject'
import { type TabletopTiles } from '../tabletopData/useTabletopTiles'
import { LOG_SUBSCRIPTION_PAYLOADS, type SubscribeHookProps } from './useTabletopSubscription'

export default function useTabletopCharactersSubscription({ supabase, campaignId }: SubscribeHookProps) {
	const { queryClient } = getRouteApi('/tabletop/$campaignId/gm/').useRouteContext()

	useMountEffect(() => {
		const channelName = `tabletop_characters:${campaignId}`
		supabase
			.channel(channelName)
			.on('postgres_changes', {
				event: '*',
				schema: 'public',
				table: 'tabletop_characters'
			}, payload => {
				type TabletopCharacters = Tables<'tabletop_characters'>

				if (LOG_SUBSCRIPTION_PAYLOADS) console.log(payload)

				switch (payload.eventType) {
					case 'INSERT': {
						void queryClient.invalidateQueries({ queryKey: [campaignId, 'tabletop', 'tiles'] })
						break
					}
					case 'UPDATE': {
						void queryClient.invalidateQueries({ queryKey: [campaignId, 'tabletop', 'tiles'] })
						break
					}
					case 'DELETE': {
						const { tt_character_id } = payload.old as TabletopCharacters

						const tilesCache = queryClient.getQueryData<TabletopTiles>([campaignId, 'tabletop', 'tiles', 'characters']) ?? {}
						const tilesArray = typedObject.entries(tilesCache)
						const tileIndex = tilesArray.findIndex(([_cord, tile]) => tile && tile.characterType === 'HERO' && tile.tabletopCharacterId === tt_character_id)
						const tileData = tilesArray[tileIndex]
						if (tileData) {
							void queryClient.cancelQueries({ queryKey: [campaignId, 'tabletop', 'tiles', 'characters'] })
							queryClient.setQueryData([campaignId, 'tabletop', 'tiles', 'characters'], (oldData: TabletopTiles) => {
								return {
									...oldData,
									[tileData[0]]: null
								}
							})
						}
						break
					}
				}
			})
			.subscribe(status => console.log(`tabletop_characters:${campaignId} ${status}`))

		return () => {
			const channel = supabase.channel(channelName)
			void supabase.removeChannel(channel)
		}
	})
}
