import { ActionIcon, Button, type ComboboxItem, Drawer, Group, rem, Select } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { Form, useLoaderData } from '@remix-run/react'
import { IconMenu2, IconX } from '@tabler/icons-react'
import { useState } from 'react'
import { type loader } from '..'

export default function SettingsPanel() {
	const [opened, handlers] = useDisclosure(false)

	return (
		<>
			<ActionIcon
				onClick={handlers.toggle}
				pos='absolute'
				right={rem(16)}
				top={rem(16)}
				size='xl'
				variant='transparent'
				color='dark.1'
			>
				<IconMenu2 size='100%' />
			</ActionIcon>

			<Drawer
				opened={opened}
				onClose={handlers.close}
				withOverlay={false}
				position='right'
				styles={{
					header: {
						backgroundColor: 'var(--mantine-color-dark-6)'
					},
					content: {
						backgroundColor: 'var(--mantine-color-dark-6)'
					}
				}}
				title='Settings'
				closeButtonProps={{
					icon: <IconX size='100%' />
				}}
			>
				<Maps />
			</Drawer>
		</>
	)
}

function Maps() {
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
