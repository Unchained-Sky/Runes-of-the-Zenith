import { ActionIcon, Drawer, rem, Tabs } from '@mantine/core'
import { IconMenu2, IconX } from '@tabler/icons-react'
import { Fragment } from 'react'
import CharacterTab from './CharacterTab'
import DebugTag from './DebugTab'
import MapTab from './MapTab'
import RoundTab from './RoundTab'
import UnitsTab from './UnitsTab'
import { useSettingsPanelStore } from './useSettingsPanelStore'

export default function SettingsPanel() {
	const {
		activeTab,
		closePanel,
		openLastTab,
		selectedCharacter: [selectedCharacterId],
		setActiveTab
	} = useSettingsPanelStore()

	return (
		<Fragment>
			<ActionIcon
				onClick={openLastTab}
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
				opened={!!activeTab}
				onClose={closePanel}
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
					value={activeTab}
					onChange={value => value && setActiveTab(value)}
					styles={{
						panel: {
							paddingTop: 'var(--mantine-spacing-md)'
						}
					}}
				>
					<Tabs.List>
						<Tabs.Tab value='character' disabled={!selectedCharacterId}>
							Character
						</Tabs.Tab>
						<Tabs.Tab value='units'>
							Units
						</Tabs.Tab>
						<Tabs.Tab value='round'>
							Round
						</Tabs.Tab>
						<Tabs.Tab value='map'>
							Map
						</Tabs.Tab>
						<Tabs.Tab value='debug'>
							Debug
						</Tabs.Tab>
					</Tabs.List>

					<Tabs.Panel value='character'>
						<CharacterTab />
					</Tabs.Panel>
					<Tabs.Panel value='units'>
						<UnitsTab />
					</Tabs.Panel>
					<Tabs.Panel value='round'>
						<RoundTab />
					</Tabs.Panel>
					<Tabs.Panel value='map'>
						<MapTab />
					</Tabs.Panel>
					<Tabs.Panel value='debug'>
						<DebugTag />
					</Tabs.Panel>
				</Tabs>
			</Drawer>
		</Fragment>
	)
}
