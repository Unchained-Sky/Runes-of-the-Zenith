import { useQueryClient } from '@tanstack/react-query'
import useMountEffect from '~/hooks/useMountEffect'
import { type Tables } from '~/supabase/databaseTypes'
import { useSupabase } from '~/supabase/useSupabase'
import getQueryKey from '../../-utils/getQueryKey'
import { type TabletopHeroData } from '../tabletopData/useTabletopHeroes'
import { LOG_SUBSCRIPTION_PAYLOADS, LOG_SUBSCRIPTION_STATUS, type TabletopSubscriptionProps } from './useTabletopSubscriptions'

export default function useTabletopHeroTurnSubscription({ channelName, table }: TabletopSubscriptionProps) {
	const { supabase } = useSupabase()
	const queryClient = useQueryClient()

	useMountEffect(() => {
		const channel = supabase
			.channel(channelName)
			.on('postgres_changes', {
				event: '*',
				schema: 'public',
				table
			}, payload => {
				if (LOG_SUBSCRIPTION_PAYLOADS) console.log(payload)

				switch (payload.eventType) {
					case 'INSERT': {
						const insertData = payload.new as Tables<'tabletop_hero_turn'>
						const queryKey = getQueryKey({ type: 'hero', data: { tabletopCharacterId: insertData.tt_character_id } })
						void queryClient.cancelQueries({ queryKey })
						queryClient.setQueriesData({ queryKey }, (oldData: TabletopHeroData) => {
							return {
								...oldData,
								turn: {
									...oldData.turn,
									[insertData.turn_type]: {
										turnType: insertData.turn_type,
										used: insertData.used,
										order: insertData.order
									}
								}
							} satisfies TabletopHeroData
						})
						break
					}
					case 'UPDATE': {
						const updateData = payload.new as Tables<'tabletop_hero_turn'>
						const queryKey = getQueryKey({ type: 'hero', data: { tabletopCharacterId: updateData.tt_character_id } })
						void queryClient.cancelQueries({ queryKey })
						queryClient.setQueriesData({ queryKey }, (oldData: TabletopHeroData) => {
							return {
								...oldData,
								turn: {
									...oldData.turn,
									[updateData.turn_type]: {
										turnType: updateData.turn_type,
										used: updateData.used,
										order: updateData.order
									}
								}
							} satisfies TabletopHeroData
						})
						break
					}
					case 'DELETE': {
						const deleteData = payload.old as Tables<'tabletop_hero_turn'>
						const queryKey = getQueryKey({ type: 'hero', data: { tabletopCharacterId: deleteData.tt_character_id } })
						void queryClient.cancelQueries({ queryKey })
						queryClient.setQueriesData({ queryKey }, (oldData: TabletopHeroData) => {
							return {
								...oldData,
								turn: {
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
							} satisfies TabletopHeroData
						})
						break
					}
				}
			})
			.subscribe(status => LOG_SUBSCRIPTION_STATUS && console.log(`${channelName} ${status}`))

		return () => void supabase.removeChannel(channel)
	})
}
