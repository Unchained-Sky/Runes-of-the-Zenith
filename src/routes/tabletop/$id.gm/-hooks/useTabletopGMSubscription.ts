import { type SupabaseClient } from '@supabase/supabase-js'
import { getRouteApi } from '@tanstack/react-router'
import useMountEffect from '~/hooks/useMountEffect'
import { type Database, type Tables } from '~/supabase/databaseTypes'
import { useSupabase } from '~/supabase/useSupabase'
import { type useTabletopCharacters } from './-useTabletopData'

export default function useTabletopGMSubscription() {
	const supabase = useSupabase()

	const { campaignId } = getRouteApi('/tabletop/$id/gm/').useLoaderData()

	useTabletopCharactersSubscription({ supabase, campaignId })
	useTabletopInfoSubscription({ supabase, campaignId })
}

type SubscribeHookProps = {
	supabase: SupabaseClient<Database>
	campaignId: number
}

function useTabletopCharactersSubscription({ supabase, campaignId }: SubscribeHookProps) {
	const { queryClient } = getRouteApi('/tabletop/$id/gm/').useRouteContext()

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
				switch (payload.eventType) {
					case 'INSERT':
					case 'UPDATE': {
						const { character_id, ...newCharacter } = payload.new as TabletopCharacters
						queryClient.setQueryData(['tabletop', 'characters', campaignId], (oldData: ReturnType<typeof useTabletopCharacters>['data']) => {
							return {
								...oldData,
								[character_id]: newCharacter
							}
						})
						break
					}
					case 'DELETE': {
						const { character_id } = payload.old as TabletopCharacters
						queryClient.setQueryData(['tabletop', 'characters', campaignId], (oldData: ReturnType<typeof useTabletopCharacters>['data']) => {
							return {
								...oldData,
								[character_id]: {
									...oldData[character_id],
									tabletop_characters: null
								}
							}
						})
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

function useTabletopInfoSubscription({ supabase, campaignId }: SubscribeHookProps) {
	const { queryClient } = getRouteApi('/tabletop/$id/gm/').useRouteContext()

	useMountEffect(() => {
		const channelName = `tabletop_info:${campaignId}`
		supabase
			.channel(channelName)
			.on('postgres_changes', {
				event: '*',
				schema: 'public',
				table: 'tabletop_info'
			}, payload => {
				switch (payload.eventType) {
					case 'INSERT':
					case 'UPDATE': {
						void queryClient.invalidateQueries({ queryKey: ['tabletop', 'tiles', campaignId] })
						break
					}
					case 'DELETE': {
						queryClient.setQueryData(['tabletop', 'tiles', campaignId], [])
						break
					}
				}
			})
			.subscribe(status => console.log(`tabletop_info:${campaignId} ${status}`))

		return () => {
			const channel = supabase.channel(channelName)
			void supabase.removeChannel(channel)
		}
	})
}
