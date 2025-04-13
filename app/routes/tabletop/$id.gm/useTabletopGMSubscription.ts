import { useLoaderData, useOutletContext } from '@remix-run/react'
import { type OutletContext } from 'app/root'
import useMountEffect from '~/hooks/useMountEffect'
import { type Tables } from '~/supabase/databaseTypes'
import { type TabletopGMLoader } from '.'
import { useTabletopGMStore } from './useTabletopGMStore'

export default function useTabletopGMSubscription() {
	useTabletopCharactersSubscription()
}

function useTabletopCharactersSubscription() {
	const { supabase } = useOutletContext<OutletContext>()
	const { campaignId } = useLoaderData<TabletopGMLoader>()

	useMountEffect(() => {
		supabase
			.channel(`tabletop:${campaignId}`)
			.on('postgres_changes', {
				event: '*',
				schema: 'public',
				table: 'tabletop_characters'
			}, payload => {
				type TabletopCharacters = Tables<'tabletop_characters'>
				switch (payload.eventType) {
					case 'INSERT': {
						const { character_id, ...newCharacter } = payload.new as TabletopCharacters
						useTabletopGMStore.getState().addCharacter(character_id, newCharacter)
						break
					}
					case 'UPDATE': {
						const { character_id, ...newCharacter } = payload.new as TabletopCharacters
						useTabletopGMStore.getState().updateCharacter(character_id, newCharacter)
						break
					}
					case 'DELETE': {
						const { character_id } = payload.old as TabletopCharacters
						useTabletopGMStore.getState().removeCharacter(character_id)
						break
					}
				}
			})
			.subscribe()
	})
}
