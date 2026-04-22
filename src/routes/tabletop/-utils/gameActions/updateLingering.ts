import { useMutation } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { type } from 'arktype'
import { type TablesUpdate } from '~/supabase/databaseTypes'
import { getServiceClient } from '~/supabase/getServiceClient'
import { characterType } from '~/types/gameTypes/character'
import { mutationError } from '~/utils/mutationError'
import { type TabletopHeroData } from '../../-hooks/tabletopData/useTabletopHeroes'
import { hasCharacterPermission } from '../characterPermission'
import { useTabletopContext } from '../TabletopContext'
import { type QuerySyncProps } from './querySync'

export function useUpdateLingering() {
	const { queryClient, campaignId } = useTabletopContext()

	return useMutation({
		mutationFn: updateLingeringAction,
		onMutate: ({ data }) => {
			updateLingeringQuerySync({ queryClient, campaignId, data })
		},
		onError: error => {
			mutationError(error, 'Failed to update lingering')
		}
	})
}

type UpdateLingeringQuerySyncProps = QuerySyncProps<typeof updateLingeringSchema>

export function updateLingeringQuerySync({ queryClient, campaignId, data }: UpdateLingeringQuerySyncProps) {
	const queryKey = [campaignId, 'tabletop', data.characterType.toLowerCase(), data.tabletopCharacterId]
	queryClient.setQueriesData({ queryKey }, (oldData: TabletopHeroData) => {
		const lingeringEffects = structuredClone(oldData.lingering)
		data.lingeringEffects.forEach(lingering => {
			if (lingering.remainingTime) {
				const lingeringIndex = lingeringEffects.findIndex(l => l.lingeringId === lingering.lingeringId)
				if (!lingeringEffects[lingeringIndex]) throw new Error('Lingering not found')
				lingeringEffects[lingeringIndex].remainingTime = lingering.remainingTime
			} else {
				lingeringEffects.splice(lingeringEffects.findIndex(l => l.lingeringId === lingering.lingeringId), 1)
			}
		})
		return {
			...oldData,
			lingering: lingeringEffects
		} satisfies TabletopHeroData
	})
}

const updateLingeringSchema = type({
	tabletopCharacterId: 'number',
	characterType,
	lingeringEffects: type({
		lingeringId: 'number',
		remainingTime: 'number'
	}).array()
})

const updateLingeringAction = createServerFn({ method: 'POST' })
	.inputValidator(updateLingeringSchema)
	.handler(async ({ data: { tabletopCharacterId, lingeringEffects } }) => {
		await hasCharacterPermission({ tabletopCharacterId })

		const serviceClient = getServiceClient()

		for (const lingering of lingeringEffects) {
			if (lingering.remainingTime) {
				const { error } = await serviceClient
					.from('tabletop_lingering')
					.update({
						remaining_time: lingering.remainingTime
					} satisfies TablesUpdate<'tabletop_lingering'>)
					.eq('linger_id', lingering.lingeringId)
					.eq('tt_character_id', tabletopCharacterId)
				if (error) throw new Error(error.message, { cause: error })
			} else {
				const { error } = await serviceClient
					.from('tabletop_lingering')
					.delete()
					.eq('linger_id', lingering.lingeringId)
					.eq('tt_character_id', tabletopCharacterId)
				if (error) throw new Error(error.message, { cause: error })
			}
		}
	})
