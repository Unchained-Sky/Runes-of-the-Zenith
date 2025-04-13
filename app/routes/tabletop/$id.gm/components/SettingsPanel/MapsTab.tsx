import { Button, type ComboboxItem, Group, Select } from '@mantine/core'
import { Form, useLoaderData } from '@remix-run/react'
import { useState } from 'react'
import { type loader } from '../../'

export default function MapsTab() {
	const { campaignId, maps } = useLoaderData<typeof loader>()

	const [value, setValue] = useState<string | null>(null)

	return (
		<Form method='POST' action={`/tabletop/${campaignId}/gm/change-map`} onSubmit={() => setValue(null)}>
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

				<Button type='submit' disabled={!value} color='green'>Submit</Button>
			</Group>
		</Form>
	)
}
