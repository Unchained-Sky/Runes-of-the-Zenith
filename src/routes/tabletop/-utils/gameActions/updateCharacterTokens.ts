import { useMutation } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { type } from 'arktype'
import { type TablesInsert } from '~/supabase/databaseTypes'
import { getServiceClient } from '~/supabase/getServiceClient'
import { characterType } from '~/types/gameTypes/character'
import { int2 } from '~/utils/int'
import { mutationError } from '~/utils/mutationError'
import { type TabletopHeroData } from '../../-hooks/tabletopData/useTabletopHeroes'
import { hasCharacterPermission } from '../characterPermission'
import { useTabletopContext } from '../TabletopContext'
import { type QuerySyncProps } from './querySync'

export function useUpdateCharacterTokens() {
	const { queryClient, campaignId } = useTabletopContext()

	return useMutation({
		mutationFn: updateCharacterTokenAction,
		onMutate: ({ data }) => {
			console.log('updateCharacterTokens', data)
			updateCharacterTokensQuerySync({ queryClient, campaignId, data })
		},
		onError: error => {
			mutationError(error, 'Failed to update hero tokens')
		}
	})
}

type UpdateCharacterTokensQuerySyncProps = QuerySyncProps<typeof updateCharacterTokenSchema>

export function updateCharacterTokensQuerySync({ queryClient, campaignId, data }: UpdateCharacterTokensQuerySyncProps) {
	const queryKey = [campaignId, 'tabletop', data.characterType.toLowerCase(), data.tabletopCharacterId]
	queryClient.setQueriesData({ queryKey }, (oldData: TabletopHeroData) => {
		return {
			...oldData,
			tokens: Object.entries(data.tokens).filter(([_name, amount]) => amount !== 0).map(([name, amount]) => ({ name, amount }))
		} satisfies TabletopHeroData
	})
}

const updateCharacterTokenSchema = type({
	tabletopCharacterId: 'number',
	characterType,
	tokens: {
		'[string]': 'number'
	}
})

const updateCharacterTokenAction = createServerFn({ method: 'POST' })
	.inputValidator(updateCharacterTokenSchema)
	.handler(async ({ data: { tabletopCharacterId, tokens } }) => {
		await hasCharacterPermission({ tabletopCharacterId })

		const { upsert: upsertTokens, delete: deleteTokens } = Object.entries(tokens).reduce<{
			upsert: { name: string, amount: number }[]
			delete: string[]
		}>((acc, [name, amount]) => {
			if (amount > int2.ceil || amount < 0) throw new Error(`Amount must be between 0 and ${int2.ceil}`)
			return {
				upsert: amount > 0 ? [...acc.upsert, { name, amount }] : acc.upsert,
				delete: amount === 0 ? [...acc.delete, name] : acc.delete
			}
		}, {
			upsert: [],
			delete: []
		})

		const serviceClient = getServiceClient()

		{
			const { error } = await serviceClient
				.from('tabletop_character_token')
				.upsert(upsertTokens.map(token => ({
					tt_character_id: tabletopCharacterId,
					token_name: token.name,
					amount: token.amount
				} satisfies TablesInsert<'tabletop_character_token'>)))
			if (error) throw new Error(error.message, { cause: error })
		}

		{
			const { error } = await serviceClient
				.from('tabletop_character_token')
				.delete()
				.eq('tt_character_id', tabletopCharacterId)
				.in('token_name', deleteTokens)
			if (error) throw new Error(error.message, { cause: error })
		}
	})
