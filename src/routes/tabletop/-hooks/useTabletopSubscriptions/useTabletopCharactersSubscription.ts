import { useQueryClient } from '@tanstack/react-query'
import useMountEffect from '~/hooks/useMountEffect'
import { LOG_SUBSCRIPTION_PAYLOADS, LOG_SUBSCRIPTION_STATUS, type TabletopSubscriptionProps } from '~/routes/tabletop/-hooks/useTabletopSubscriptions/useTabletopSubscriptions'
import { type Tables } from '~/supabase/databaseTypes'
import { useSupabase } from '~/supabase/useSupabase'
import { type TabletopGMEnemyData } from '../../$campaignId.gm/-hooks/tabletopData/useGMTabletopEnemies'
import getQueryKey from '../../-utils/getQueryKey'
import { type TabletopEnemyList } from '../tabletopData/useTabletopEnemyList'
import { type TabletopHeroData } from '../tabletopData/useTabletopHeroes'
import { type TabletopHeroesList } from '../tabletopData/useTabletopHeroList'
import { useTabletopEnvironmentStore } from '../useTabletopEnvironmentStore'

export default function useTabletopCharactersSubscription({ channelName, table }: TabletopSubscriptionProps) {
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
						const insertData = payload.new as Tables<'tabletop_characters'>
						const { queryKey } = getQueryKey({ type: 'character', data: { tabletopCharacterId: insertData.tt_character_id, queryClient } })
						void queryClient.invalidateQueries({ queryKey })
						break
					}
					case 'UPDATE': {
						const updateData = payload.new as Tables<'tabletop_characters'>

						const { queryKey } = getQueryKey({ type: 'character', data: { tabletopCharacterId: updateData.tt_character_id, queryClient } })
						void queryClient.cancelQueries({ queryKey })

						switch (updateData.character_type) {
							case 'HERO': {
								queryClient.setQueriesData({ queryKey }, (oldData: TabletopHeroData) => {
									return {
										...oldData,
										tabletopStats: {
											health: updateData.health,
											wounds: updateData.wounds,
											shield: updateData.shield,
											trauma: updateData.trauma,
											movement: updateData.movement
										}
									} satisfies TabletopHeroData
								})
								break
							}
							case 'ENEMY': {
								const { role } = useTabletopEnvironmentStore.getState()
								if (role !== 'gm') return
								queryClient.setQueriesData({ queryKey }, (oldData: TabletopGMEnemyData) => {
									return {
										...oldData,
										tabletopStats: {
											...oldData.tabletopStats,
											health: updateData.health,
											wounds: updateData.wounds,
											shield: updateData.shield,
											trauma: updateData.trauma,
											movement: updateData.movement
										}
									} satisfies TabletopGMEnemyData
								})
								break
							}
						}
						break
					}
					case 'DELETE': {
						const deleteData = payload.old as Tables<'tabletop_characters'>
						switch (deleteData.character_type) {
							case 'HERO': {
								const queryKey = getQueryKey({ type: 'hero-list' })
								void queryClient.cancelQueries({ queryKey })
								queryClient.setQueriesData({ queryKey }, (oldData: TabletopHeroesList) => {
									return oldData.map(hero => hero.heroId !== deleteData.tt_character_id
										? hero
										: {
											...hero,
											tabletopCharacterId: null
										} satisfies TabletopHeroesList[number])
								})
								break
							}
							case 'ENEMY': {
								const queryKey = getQueryKey({ type: 'enemy-list' })
								void queryClient.cancelQueries({ queryKey })
								queryClient.setQueriesData({ queryKey }, (oldData: TabletopEnemyList) => {
									return oldData.filter(tabletopCharacterId => tabletopCharacterId !== deleteData.tt_character_id)
								})
								break
							}
						}
						break
					}
				}
			})
			.subscribe(status => LOG_SUBSCRIPTION_STATUS && console.log(`${channelName} ${status}`))

		return () => void supabase.removeChannel(channel)
	})
}
