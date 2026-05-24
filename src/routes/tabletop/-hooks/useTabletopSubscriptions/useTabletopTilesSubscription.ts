import useMountEffect from '~/hooks/useMountEffect'
import { LOG_SUBSCRIPTION_PAYLOADS } from '~/routes/tabletop/-hooks/useTabletopSubscriptions/useTabletopSubscriptions'
import { useTabletopContext } from '~/routes/tabletop/-utils/TabletopContext'
import { type Tables } from '~/supabase/databaseTypes'
import { useSupabase } from '~/supabase/useSupabase'
import useCharacterLookup from '../../-utils/useCharacterLookup'
import { type TabletopTiles } from '../tabletopData/useTabletopTiles'

type TabletopTilesTable = Omit<Tables<'tabletop_tiles'>, 'tt_character_id'> & { tt_character_id?: number | null }

export default function useTabletopTilesSubscription() {
	const { supabase } = useSupabase()
	const { queryClient, campaignId } = useTabletopContext()

	const characterLookup = useCharacterLookup()

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
					case 'INSERT':
					case 'UPDATE': {
						const upsertData = payload.new as Tables<'tabletop_tiles'>

						const queryKey = [campaignId, 'tabletop', 'tiles', 'characters']
						void queryClient.cancelQueries({ queryKey })
						queryClient.setQueryData(queryKey, (oldData: TabletopTiles) => {
							const cords = `${upsertData.q},${upsertData.r},${upsertData.s}` as const
							return {
								...oldData,
								[cords]: upsertData.tt_character_id
									? {
										tabletopCharacterId: upsertData.tt_character_id,
										characterType: characterLookup(upsertData.tt_character_id)
									}
									: null
							} satisfies TabletopTiles
						})
						break
					}
					case 'DELETE': {
						const deleteData = payload.old as TabletopTilesTable

						const queryKey = [campaignId, 'tabletop', 'tiles', 'characters']
						void queryClient.cancelQueries({ queryKey })
						queryClient.setQueryData(queryKey, (oldData: TabletopTiles) => {
							const cords = `${deleteData.q},${deleteData.r},${deleteData.s}` as const
							return {
								...oldData,
								[cords]: null
							} satisfies TabletopTiles
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
