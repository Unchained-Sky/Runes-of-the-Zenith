import { useMutation } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { type } from 'arktype'
import { type TablesInsert } from '~/supabase/databaseTypes'
import { getServiceClient } from '~/supabase/getServiceClient'
import { requireGM } from '~/supabase/requireGM'
import { mutationError } from '~/utils/mutationError'
import { type HeroTurn } from '../-hooks/tabletopData/useTabletopHeroRounds'

export function useStartRound() {
	const routeApi = getRouteApi('/tabletop/$campaignId/gm/')
	const { queryClient } = routeApi.useRouteContext()
	const { campaignId } = routeApi.useLoaderData()

	return useMutation({
		mutationFn: () => startRoundAction({ data: { campaignId } }),
		onMutate: () => {
			void queryClient.cancelQueries({ queryKey: [campaignId, 'tabletop', 'hero-rounds'] })
			queryClient.setQueryData([campaignId, 'tabletop', 'hero-rounds'], (oldData: HeroTurn[]) => {
				return oldData.map<HeroTurn>(turn => ({
					used: false,
					order: null,
					tabletopCharacterId: turn.tabletopCharacterId,
					turnType: turn.turnType
				}))
			})
		},
		onError: error => {
			mutationError(error, 'Failed to start round')
		}
	})
}

const startRoundSchema = type({
	campaignId: 'number'
})

export const startRoundAction = createServerFn({ method: 'POST' })
	.validator(startRoundSchema)
	.handler(async ({ data: { campaignId } }) => {
		const { supabase } = await requireGM({ campaignId })

		const serviceClient = getServiceClient()

		{
			const { data: heroesList, error: heroesError } = await supabase
				.from('tabletop_hero_turn')
				.select(`
					tabletop_characters (
						characterId: tt_character_id
					)
				`)
				.eq('tabletop_characters.campaign_id', campaignId)
			if (heroesError) throw new Error(heroesError.message, { cause: heroesError })

			// delete all hero turns
			const { error } = await serviceClient
				.from('tabletop_hero_turn')
				.delete()
				.in('tt_character_id', heroesList.map(character => character.tabletop_characters.characterId))
			if (error) throw new Error(error.message, { cause: error })
		}

		{
			// insert new hero turns
			const { data: heroesList, error: heroesError } = await supabase
				.from('tabletop_characters')
				.select('characterId: tt_character_id')
				.eq('campaign_id', campaignId)
				.eq('character_type', 'HERO')
			if (heroesError) throw new Error(heroesError.message, { cause: heroesError })

			const turns = heroesList.flatMap(({ characterId }) => [
				{
					tt_character_id: characterId,
					turn_type: 'PRIMARY',
					used: false,
					order: null
				} satisfies TablesInsert<'tabletop_hero_turn'>,
				{
					tt_character_id: characterId,
					turn_type: 'SECONDARY',
					used: false,
					order: null
				} satisfies TablesInsert<'tabletop_hero_turn'>
			])
			const { error } = await serviceClient
				.from('tabletop_hero_turn')
				.insert(turns)
			if (error) throw new Error(error.message, { cause: error })
		}
	})
