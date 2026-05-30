import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { type } from 'arktype'
import { type TablesInsert } from '~/supabase/databaseTypes'
import { lingeringExtraData } from '~/supabase/extraDataFormatter/lingeringExtraData'
import { getServiceClient } from '~/supabase/getServiceClient'
import { characterType } from '~/types/gameTypes/character'
import { mutationError } from '~/utils/mutationError'
import { type TabletopHeroData } from '../../-hooks/tabletopData/useTabletopHeroes'
import { hasCharacterPermission } from '../characterPermission'
import getQueryKey from '../getQueryKey'
import { type QuerySyncProps } from './querySync'

export function useAddLingering() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: addLingeringAction,
		onMutate: ({ data }) => {
			addLingeringQuerySyncMutate({ queryClient, data })
		},
		onSuccess: (data, variables) => {
			addLingeringQuerySyncSuccess({ queryClient, data, variables: variables.data })
		},
		onError: error => {
			mutationError(error, 'Failed to add lingering')
		}
	})
}

type AddLingeringQuerySyncMutateProps = QuerySyncProps<typeof addLingeringSchema>

export function addLingeringQuerySyncMutate({ queryClient, data }: AddLingeringQuerySyncMutateProps) {
	const queryKey = getQueryKey({ type: 'character', data: { tabletopCharacterId: data.tabletopCharacterId, queryClient } })
	queryClient.setQueriesData({ queryKey }, (oldData: TabletopHeroData) => {
		const lingeringEffects = structuredClone(oldData.lingering)
		data.lingeringEffects.forEach((lingering, i) => {
			lingeringEffects.push({ ...lingering, lingeringId: -1 - i })
		})
		return {
			...oldData,
			lingering: lingeringEffects
		} satisfies TabletopHeroData
	})
}

type AddLingeringQuerySyncSuccessProps = QuerySyncProps & {
	data: Awaited<ReturnType<typeof addLingeringAction>>
	variables: typeof addLingeringSchema.infer
}

export function addLingeringQuerySyncSuccess({ queryClient, data, variables }: AddLingeringQuerySyncSuccessProps) {
	const queryKey = getQueryKey({ type: 'character', data: { tabletopCharacterId: variables.tabletopCharacterId, queryClient } })
	queryClient.setQueriesData({ queryKey }, (oldData: TabletopHeroData) => {
		let lingeringEffects = structuredClone(oldData.lingering)
		lingeringEffects = lingeringEffects.filter(l => l.lingeringId > 0)
		data.forEach(lingering => {
			lingeringEffects.push(lingering)
		})
		return {
			...oldData,
			lingering: lingeringEffects
		} satisfies TabletopHeroData
	})
}

const addLingeringSchema = type({
	tabletopCharacterId: 'number',
	characterType,
	lingeringEffects: type({
		decrementTime: type('"CUSTOM" | "START_ROUND" | "END_ROUND" | "START_TURN" | "END_TURN"'),
		remainingTime: 'number',
		data: lingeringExtraData
	}).array()
})

const addLingeringAction = createServerFn({ method: 'POST' })
	.inputValidator(addLingeringSchema)
	.handler(async ({ data: { tabletopCharacterId, lingeringEffects } }) => {
		await hasCharacterPermission({ tabletopCharacterId })

		const serviceClient = getServiceClient()

		const out: TabletopHeroData['lingering'] = []

		for (const lingering of lingeringEffects) {
			const { data, error } = await serviceClient
				.from('tabletop_lingering')
				.insert({
					tt_character_id: tabletopCharacterId,
					decrement_time: lingering.decrementTime,
					remaining_time: lingering.remainingTime,
					data: lingering.data
				} satisfies TablesInsert<'tabletop_lingering'>)
				.select('lingeringId: linger_id')
				.limit(1)
				.single()
			if (error) throw new Error(error.message, { cause: error })
			out.push({
				lingeringId: data.lingeringId,
				decrementTime: lingering.decrementTime,
				remainingTime: lingering.remainingTime,
				data: lingering.data
			})
		}

		return out
	})
