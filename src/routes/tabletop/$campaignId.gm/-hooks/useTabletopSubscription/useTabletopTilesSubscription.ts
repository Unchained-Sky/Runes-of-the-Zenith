import { getRouteApi } from '@tanstack/react-router'
import useMountEffect from '~/hooks/useMountEffect'
import { type Tables } from '~/supabase/databaseTypes'
import { typedObject } from '~/types/typedObject'
import { type TabletopTile, type TabletopTiles } from '../tabletopData/useTabletopTiles'
import { LOG_SUBSCRIPTION_PAYLOADS, type SubscribeHookProps } from './useTabletopSubscription'

type TabletopTilesTable = Omit<Tables<'tabletop_tiles'>, 'tt_character_id'> & { tt_character_id?: number | null }

export default function useTabletopTilesSubscription({ supabase, campaignId }: SubscribeHookProps) {
	const { queryClient } = getRouteApi('/tabletop/$campaignId/gm/').useRouteContext()

	useMountEffect(() => {
		const channelName = `tabletop_tiles:${campaignId}`
		supabase
			.channel(channelName)
			.on('postgres_changes', {
				event: '*',
				schema: 'public',
				table: 'tabletop_tiles'
			}, payload => {
				if (LOG_SUBSCRIPTION_PAYLOADS) console.log(payload)

				switch (payload.eventType) {
					case 'INSERT': {
						const { tt_character_id: tabletopCharacterId, q, r, s } = payload.new as TabletopTilesTable
						if (!tabletopCharacterId) break

						void queryClient.cancelQueries({ queryKey: [campaignId, 'tabletop', 'tiles', 'characters'] })
						queryClient.setQueryData([campaignId, 'tabletop', 'tiles', 'characters'], (oldData: TabletopTiles) => {
							const [oldCord, oldCordData] = typedObject.entries(oldData)
								.find(([_keys, value]) => value?.tabletopCharacterId === tabletopCharacterId) ?? []
							if (!oldCord || !oldCordData) {
								void queryClient.invalidateQueries({ queryKey: [campaignId, 'tabletop', 'tiles'] })
								return oldData
							}

							const cord = `${q},${r},${s}` as const
							return {
								...oldData,
								[oldCord]: null,
								[cord]: {
									tabletopCharacterId,
									characterType: oldCordData.characterType
								} satisfies TabletopTile
							}
						})
						break
					}
					case 'UPDATE': {
						const { tt_character_id: tabletopCharacterId, q, r, s } = payload.new as TabletopTilesTable

						void queryClient.cancelQueries({ queryKey: [campaignId, 'tabletop', 'tiles', 'characters'] })
						queryClient.setQueryData([campaignId, 'tabletop', 'tiles', 'characters'], (oldData: TabletopTiles) => {
							const cord = `${q},${r},${s}` as const

							if (!tabletopCharacterId) {
								return {
									...oldData,
									[cord]: null
								}
							}

							const [oldCord, oldCordData] = typedObject.entries(oldData)
								.find(([_keys, value]) => value?.tabletopCharacterId === tabletopCharacterId) ?? []
							if (!oldCord || !oldCordData) {
								void queryClient.invalidateQueries({ queryKey: [campaignId, 'tabletop', 'tiles'] })
								return oldData
							}

							return {
								...oldData,
								[`${q},${r},${s}`]: {
									tabletopCharacterId,
									characterType: oldCordData.characterType
								}
							}
						})
						break
					}
					case 'DELETE': {
						void queryClient.invalidateQueries({ queryKey: [campaignId, 'tabletop', 'tiles'] })
						break
					}
				}
			})
			.subscribe(status => console.log(`tabletop_tiles:${campaignId} ${status}`))

		return () => {
			const channel = supabase.channel(channelName)
			void supabase.removeChannel(channel)
		}
	})
}
