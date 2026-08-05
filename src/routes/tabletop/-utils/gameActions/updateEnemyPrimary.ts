import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createServerFn, createServerOnlyFn } from '@tanstack/react-start'
import { type } from 'arktype'
import { type TablesUpdate } from '~/supabase/databaseTypes'
import { getServiceClient } from '~/supabase/getServiceClient'
import { requireGM } from '~/supabase/requireGM'
import { mutationError } from '~/utils/mutationError'
import { type TabletopGMEnemyData } from '../../$campaignId.gm/-hooks/tabletopData/useGMTabletopEnemies'
import { type TabletopEnemyList } from '../../-hooks/tabletopData/useTabletopEnemyList'
import getQueryKey from '../getQueryKey'
import { type QuerySyncProps } from './querySync'

export function useUpdateEnemyPrimary() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: updateEnemyPrimaryAction,
		scope: {
			id: 'tabletop-update-enemy-primary'
		},
		onMutate: ({ data }) => {
			updateEnemyPrimarySync({ queryClient, data })
		},
		onError: error => {
			mutationError(error, 'Failed to update enemy primary')
		}
	})
}

type UpdateEnemyPrimaryQuerySyncProps = QuerySyncProps<typeof updateEnemyPrimarySchema>

export function updateEnemyPrimarySync({ queryClient, data }: UpdateEnemyPrimaryQuerySyncProps) {
	const syncEnemy = (tabletopCharacterId: number) => {
		const queryKey = getQueryKey({ type: 'enemy', data: { tabletopCharacterId } })
		void queryClient.cancelQueries({ queryKey })
		queryClient.setQueryData(queryKey, (oldData: TabletopGMEnemyData) => {
			return {
				...oldData,
				tabletopStats: {
					...oldData.tabletopStats,
					usedPrimary: data.usedPrimary
				}
			} satisfies TabletopGMEnemyData
		})
	}

	if ('tabletopCharacterId' in data) {
		syncEnemy(data.tabletopCharacterId)
	} else {
		const queryKey = getQueryKey({ type: 'enemy-list' })
		queryClient.getQueryData<TabletopEnemyList>(queryKey)
			?.forEach(tabletopCharacterId => syncEnemy(tabletopCharacterId))
	}
}

const updateEnemyPrimarySchema = type([
	{
		tabletopCharacterId: 'number',
		usedPrimary: 'boolean'
	},
	'|',
	{
		campaignId: 'number',
		usedPrimary: 'boolean'
	}
])

const updateEnemyPrimaryAction = createServerFn({ method: 'POST' })
	.inputValidator(updateEnemyPrimarySchema)
	.handler(async ({ data: { usedPrimary, ...props } }) => {
		if ('tabletopCharacterId' in props) {
			await requireGM({ tabletopCharacterId: props.tabletopCharacterId })
		} else {
			await requireGM({ campaignId: props.campaignId })
		}

		await UNSAFE_updateEnemyPrimary({ usedPrimary, ...props })
	})

export const UNSAFE_updateEnemyPrimary = createServerOnlyFn(async ({ usedPrimary, ...props }: typeof updateEnemyPrimarySchema.infer) => {
	const serviceClient = getServiceClient()

	if ('tabletopCharacterId' in props) {
		const { error } = await serviceClient
			.from('tabletop_enemy')
			.update({
				used_primary: usedPrimary
			} satisfies TablesUpdate<'tabletop_enemy'>)
			.eq('tt_character_id', props.tabletopCharacterId)
		if (error) throw new Error(error.message, { cause: error })
	} else {
		const { data, error } = await serviceClient
			.from('tabletop_characters')
			.select('tabletopCharacterId: tt_character_id')
			.eq('campaign_id', props.campaignId)
			.eq('character_type', 'ENEMY')
		if (error) throw new Error(error.message, { cause: error })

		const { error: updateError } = await serviceClient
			.from('tabletop_enemy')
			.update({
				used_primary: usedPrimary
			} satisfies TablesUpdate<'tabletop_enemy'>)
			.in('tt_character_id', data.map(({ tabletopCharacterId }) => tabletopCharacterId))
		if (updateError) throw new Error(updateError.message, { cause: updateError })
	}
})
