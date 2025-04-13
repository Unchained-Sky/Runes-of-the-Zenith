import { ActionIcon, Drawer, rem, Tabs } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { IconMenu2, IconX } from '@tabler/icons-react'
import MapsTab from './MapsTab'
import UnitsTab from './UnitsTab'

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
				size='lg'
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
				<Tabs
					defaultValue='maps'
					styles={{
						panel: {
							paddingTop: 'var(--mantine-spacing-md)'
						}
					}}
				>
					<Tabs.List>
						<Tabs.Tab value='maps'>
							Maps
						</Tabs.Tab>
						<Tabs.Tab value='units'>
							Units
						</Tabs.Tab>
					</Tabs.List>

					<Tabs.Panel value='maps'>
						<MapsTab />
					</Tabs.Panel>
					<Tabs.Panel value='units'>
						<UnitsTab />
					</Tabs.Panel>
				</Tabs>
			</Drawer>
		</>
	)
}
