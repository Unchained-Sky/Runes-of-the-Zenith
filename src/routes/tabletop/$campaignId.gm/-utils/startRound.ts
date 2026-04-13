import { type QueryClient, useMutation } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { type } from 'arktype'
import { useTabletopContext } from '~/routes/tabletop/-utils/TabletopContext'
import { type TablesInsert } from '~/supabase/databaseTypes'
import { getServiceClient } from '~/supabase/getServiceClient'
import { requireGM } from '~/supabase/requireGM'
import { type TabletopHeroData } from '~/tt/-hooks/tabletopData/useTabletopHeroes'
import { type HeroTurn } from '~/tt/-hooks/tabletopData/useTabletopHeroRounds'
import { type TabletopRoundData } from '~/tt/-hooks/tabletopData/useTabletopRound'
import { mutationError } from '~/utils/mutationError'

export function useStartRound() {
	const { queryClient, campaignId } = useTabletopContext()

	return useMutation({
		mutationFn: () => startRoundAction({ data: { campaignId } }),
		onMutate: () => {
			startRoundQuerySync({ queryClient, campaignId })
		},
		onError: error => {
			mutationError(error, 'Failed to start round')
		}
	})
}

type StartRoundQuerySyncProps = {
	queryClient: QueryClient
	campaignId: number
}

export const startRoundQuerySync = ({ queryClient, campaignId }: StartRoundQuerySyncProps) => {
	void queryClient.cancelQueries({ queryKey: [campaignId, 'tabletop', 'hero-rounds'] })
	queryClient.setQueryData([campaignId, 'tabletop', 'hero-rounds'], (oldData: HeroTurn[]) => {
		return oldData.map<HeroTurn>(turn => ({
			used: false,
			order: null,
			tabletopCharacterId: turn.tabletopCharacterId,
			turnType: turn.turnType
		}))
	})

	void queryClient.cancelQueries({ queryKey: [campaignId, 'tabletop', 'hero'] })
	queryClient.setQueriesData({ queryKey: [campaignId, 'tabletop', 'hero'] }, (oldData: TabletopHeroData) => {
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

	void queryClient.cancelQueries({ queryKey: [campaignId, 'tabletop', 'round'] })
	queryClient.setQueryData([campaignId, 'tabletop', 'round'], (oldData: TabletopRoundData) => {
		return {
			...oldData,
			round: oldData.round + 1
		} satisfies TabletopRoundData
	})
}

const startRoundSchema = type({
	campaignId: 'number'
})

export const startRoundAction = createServerFn({ method: 'POST' })
	.inputValidator(startRoundSchema)
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

		{
			const { data, error: selectError } = await supabase
				.from('tabletop_info')
				.select('round')
				.eq('campaign_id', campaignId)
				.limit(1)
				.single()
			if (selectError) throw new Error(selectError.message, { cause: selectError })

			const { error: updateError } = await serviceClient
				.from('tabletop_info')
				.update({ round: data.round + 1 })
				.eq('campaign_id', campaignId)
			if (updateError) throw new Error(updateError.message, { cause: updateError })
		}
	})
