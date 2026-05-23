import useMountEffect from '~/hooks/useMountEffect'
import { LOG_SUBSCRIPTION_PAYLOADS } from '~/routes/tabletop/-hooks/useTabletopSubscriptions/useTabletopSubscriptions'
import { type Tables } from '~/supabase/databaseTypes'
import { useSupabase } from '~/supabase/useSupabase'
import { type TabletopGMEnemyData } from '../../$campaignId.gm/-hooks/tabletopData/useGMTabletopEnemies'
import { useTabletopContext } from '../../-utils/TabletopContext'
import { type TabletopEnemyList } from '../tabletopData/useTabletopEnemyList'
import { type TabletopHeroData } from '../tabletopData/useTabletopHeroes'
import { type TabletopHeroesList } from '../tabletopData/useTabletopHeroList'

export default function useTabletopCharactersSubscription() {
	const { supabase } = useSupabase()
	const { queryClient, campaignId, role } = useTabletopContext()

	useMountEffect(() => {
		const channelName = `tabletop_characters:${campaignId}`
		supabase
			.channel(channelName)
			.on('postgres_changes', {
				event: '*',
				schema: 'public',
				table: 'tabletop_characters'
			}, payload => {
				if (LOG_SUBSCRIPTION_PAYLOADS) console.log(payload)

				switch (payload.eventType) {
					case 'INSERT': {
						const insertData = payload.new as Tables<'tabletop_characters'>
						void queryClient.invalidateQueries({ queryKey: [campaignId, 'tabletop', `${insertData.character_type.toLowerCase()}-list`] })
						break
					}
					case 'UPDATE': {
						const updateData = payload.new as Tables<'tabletop_characters'>

						const queryKey = [campaignId, 'tabletop', updateData.character_type.toLowerCase(), updateData.tt_character_id]
						void queryClient.invalidateQueries({ queryKey })

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
								const queryKey = [campaignId, 'tabletop', 'hero-list']
								void queryClient.invalidateQueries({ queryKey })
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
								const queryKey = [campaignId, 'tabletop', 'enemy-list']
								void queryClient.invalidateQueries({ queryKey })
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
			.subscribe(status => console.log(`${channelName} ${status}`))

		return () => {
			const channel = supabase.channel(channelName)
			void supabase.removeChannel(channel)
		}
	})
}
