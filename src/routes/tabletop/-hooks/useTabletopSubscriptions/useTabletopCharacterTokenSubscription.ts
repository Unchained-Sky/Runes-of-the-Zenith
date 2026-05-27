import { useQueryClient } from '@tanstack/react-query'
import useMountEffect from '~/hooks/useMountEffect'
import { type Tables } from '~/supabase/databaseTypes'
import { useSupabase } from '~/supabase/useSupabase'
import { type TabletopGMEnemyData } from '../../$campaignId.gm/-hooks/tabletopData/useGMTabletopEnemies'
import getQueryKey from '../../-utils/getQueryKey'
import { type TabletopHeroData } from '../tabletopData/useTabletopHeroes'
import { useTabletopEnvironmentStore } from '../useTabletopEnvironmentStore'
import { LOG_SUBSCRIPTION_PAYLOADS, LOG_SUBSCRIPTION_STATUS, type TabletopSubscriptionProps } from './useTabletopSubscriptions'

export default function useTabletopCharacterTokenSubscription({ channelName, table }: TabletopSubscriptionProps) {
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

				const { role } = useTabletopEnvironmentStore.getState()

				switch (payload.eventType) {
					case 'INSERT': {
						const insertData = payload.new as Tables<'tabletop_character_token'>

						const { queryKey, characterType } = getQueryKey({ type: 'character', data: { tabletopCharacterId: insertData.tt_character_id, queryClient } })
						void queryClient.cancelQueries({ queryKey })

						if (characterType === 'ENEMY' && role !== 'gm') return

						queryClient.setQueriesData({ queryKey }, (oldData: TabletopHeroData | TabletopGMEnemyData) => {
							return {
								...oldData,
								tokens: [
									...oldData.tokens.filter(token => token.name !== insertData.token_name),
									{ name: insertData.token_name, amount: insertData.amount }
								]
							} satisfies TabletopHeroData | TabletopGMEnemyData
						})
						break
					}
					case 'UPDATE': {
						const updateData = payload.new as Tables<'tabletop_character_token'>

						const { queryKey, characterType } = getQueryKey({ type: 'character', data: { tabletopCharacterId: updateData.tt_character_id, queryClient } })
						void queryClient.cancelQueries({ queryKey })

						if (characterType === 'ENEMY' && role !== 'gm') return

						queryClient.setQueriesData({ queryKey }, (oldData: TabletopHeroData | TabletopGMEnemyData) => {
							return {
								...oldData,
								tokens: oldData.tokens.map(token => {
									if (token.name === updateData.token_name) {
										return { name: token.name, amount: updateData.amount }
									}
									return token
								})
							} satisfies TabletopHeroData | TabletopGMEnemyData
						})
						break
					}
					case 'DELETE': {
						const deleteData = payload.old as Tables<'tabletop_character_token'>

						const { queryKey, characterType } = getQueryKey({ type: 'character', data: { tabletopCharacterId: deleteData.tt_character_id, queryClient } })
						void queryClient.cancelQueries({ queryKey })

						if (characterType === 'ENEMY' && role !== 'gm') return

						queryClient.setQueriesData({ queryKey }, (oldData: TabletopHeroData | TabletopGMEnemyData) => {
							return {
								...oldData,
								tokens: oldData.tokens.filter(token => token.name !== deleteData.token_name)
							} satisfies TabletopHeroData | TabletopGMEnemyData
						})
						break
					}
				}
			})
			.subscribe(status => LOG_SUBSCRIPTION_STATUS && console.log(`${channelName} ${status}`))

		return () => void supabase.removeChannel(channel)
	})
}
