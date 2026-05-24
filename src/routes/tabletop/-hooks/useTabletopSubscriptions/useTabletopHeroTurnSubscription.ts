import useMountEffect from '~/hooks/useMountEffect'
import { type Tables } from '~/supabase/databaseTypes'
import { useSupabase } from '~/supabase/useSupabase'
import { useTabletopContext } from '../../-utils/TabletopContext'
import { type TabletopHeroData } from '../tabletopData/useTabletopHeroes'
import { LOG_SUBSCRIPTION_PAYLOADS } from './useTabletopSubscriptions'

export default function useTabletopHeroTurnSubscription() {
	const { supabase } = useSupabase()
	const { queryClient, campaignId } = useTabletopContext()

	useMountEffect(() => {
		const channelName = `tabletop_hero_turn:${campaignId}`
		supabase
			.channel(channelName)
			.on('postgres_changes', {
				event: '*',
				schema: 'public',
				table: 'tabletop_hero_turn'
			}, payload => {
				if (LOG_SUBSCRIPTION_PAYLOADS) console.log(payload)

				switch (payload.eventType) {
					case 'INSERT': {
						const insertData = payload.new as Tables<'tabletop_hero_turn'>
						const queryKey = [campaignId, 'tabletop', 'hero', insertData.tt_character_id]
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
						const queryKey = [campaignId, 'tabletop', 'hero', updateData.tt_character_id]
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
						const queryKey = [campaignId, 'tabletop', 'hero', deleteData.tt_character_id]
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
			.subscribe(status => console.log(`${channelName} ${status}`))

		return () => {
			const channel = supabase.channel(channelName)
			void supabase.removeChannel(channel)
		}
	})
}
