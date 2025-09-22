import { getRouteApi } from '@tanstack/react-router'
import { createServerFn, useServerFn } from '@tanstack/react-start'
import { type } from 'arktype'
import { getServiceClient } from '~/supabase/getServiceClient'
import { requireAccount } from '~/supabase/requireAccount'
import { type FormResponse } from '~/types/formResponse'
import { typedObject } from '~/types/typedObject'
import { useMapEditStore } from './useMapEditStore'

const submitMapChangesSchema = type({
	'mapId': 'string.digits',
	'mapName?': 'string | null',
	'tiles?': {
		'[string]': {
			cord: ['number', 'number', 'number'],
			image: 'string',
			// eslint-disable-next-line @stylistic/quotes
			terrainType: "'BLOCKED' | 'NORMAL' | 'ROUGH' | 'HARSH' | 'GAP'"
		}
	}
})

const submitMapChanges = createServerFn({ method: 'POST' })
	.validator(submitMapChangesSchema)
	.handler(async ({ data }) => {
		const mapId = parseInt(data.mapId)

		const { supabase, user } = await requireAccount({ backlink: '/homebrew/map' })

		{
			const { data, error } = await supabase
				.from('map_info')
				.select('user_id')
				.eq('map_id', mapId)
				.limit(1)
				.single()
			if (error || data.user_id !== user.id) throw new Error('Invalid user')
		}

		const serviceClient = getServiceClient()

		if (data.mapName) {
			const { error } = await serviceClient
				.from('map_info')
				.update({
					map_name: data.mapName
				})
				.eq('map_id', mapId)
			if (error) throw new Error(error.message, { cause: error })
		}

		if (data.tiles) {
			const { error: deleteError } = await serviceClient
				.from('map_combat_tile')
				.delete()
				.eq('map_id', mapId)
			if (deleteError) throw new Error(deleteError.message, { cause: deleteError })

			const { error: insertError } = await serviceClient
				.from('map_combat_tile')
				.insert(Object.values(data.tiles).map(tile => ({
					map_id: mapId,
					q: tile.cord[0],
					r: tile.cord[1],
					s: tile.cord[2],
					image: tile.image,
					terrain_type: tile.terrainType
				})))
			if (insertError) throw new Error(insertError.message, { cause: insertError })
		}

		return {
			error: false,
			message: 'Save Success'
		} satisfies FormResponse
	})

export const useSubmitMapChanges = () => {
	const { id: mapId } = getRouteApi('/homebrew/map/$id_/edit/').useParams()

	const postSubmit = useServerFn(submitMapChanges)

	return async () => {
		useMapEditStore.setState({ submitting: true })

		const { hasChanged } = useMapEditStore.getState()
		const changedKeys = typedObject.entries(hasChanged)
			.filter(([_key, value]) => value)
			.map(([key, _value]) => key)
		const data = typedObject.pick(useMapEditStore.getState(), changedKeys)

		await postSubmit({ data: { mapId, ...data } })

		useMapEditStore.setState({ submitting: false })
	}
}
