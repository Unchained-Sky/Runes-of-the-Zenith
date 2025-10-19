import { Button, type ComboboxItem, Group, Select } from '@mantine/core'
import { useMutation } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { type } from 'arktype'
import { useState } from 'react'
import { getServiceClient } from '~/supabase/getServiceClient'
import { requireAccount } from '~/supabase/requireAccount'
import { useTabletopMapList, useTabletopMapTiles } from '../../-hooks/useTabletopData'

export default function MapsTab() {
	const { campaignId } = getRouteApi('/tabletop/$campaignId/gm/').useParams()
	const { data: maps } = useTabletopMapList()

	const [value, setValue] = useState<string | null>(null)

	const changeMap = useMutation({
		mutationFn: changeMapAction,
		onSuccess: () => {
			setValue(null)
		}
	})

	const { isFetching } = useTabletopMapTiles()

	return (
		<Group align='flex-end'>
			<Select
				clearable
				searchable
				label='Change the current map'
				placeholder='Map Name'
				name='mapId'
				data={maps.map<ComboboxItem>(map => ({ value: map.mapId.toString(), label: map.name }))}
				value={value}
				onChange={setValue}
				style={{ flex: 1 }}
			/>

			<Button
				type='submit'
				disabled={!value}
				loading={changeMap.isPending || isFetching}
				color='green'
				onClick={() => {
					if (!value) return
					changeMap.mutate({ data: { campaignId: +campaignId, mapId: +value } })
				}}
			>
				Submit
			</Button>
		</Group>
	)
}

const changeMapSchema = type({
	campaignId: 'number',
	mapId: 'number'
})

const changeMapAction = createServerFn({ method: 'POST' })
	.validator(changeMapSchema)
	.handler(async ({ data: { campaignId, mapId } }) => {
		const { supabase, user } = await requireAccount()

		{
			// check if user is GM
			const { error } = await supabase
				.from('campaign_info')
				.select('user_id')
				.eq('campaign_id', campaignId)
				.eq('user_id', user.id)
				.limit(1)
				.single()
			if (error) throw new Error(error.message, { cause: error })
		}

		{
			// check if map exists
			const { error } = await supabase
				.from('map_info')
				.select('map_type')
				.eq('map_id', mapId)
				.limit(1)
				.single()
			if (error) throw new Error(error.message, { cause: error })
		}

		const serviceClient = getServiceClient()

		{
			// delete all characters on the map
			const { error } = await serviceClient
				.from('tabletop_tiles')
				.delete()
				.eq('campaign_id', campaignId)
			if (error) throw new Error(error.message, { cause: error })
		}

		{
			// update the map_id for the campaign
			const { error } = await serviceClient
				.from('tabletop_info')
				.upsert({ campaign_id: campaignId, map_id: mapId })
				.eq('campaign_id', campaignId)
			if (error) throw new Error(error.message, { cause: error })
		}
	})
