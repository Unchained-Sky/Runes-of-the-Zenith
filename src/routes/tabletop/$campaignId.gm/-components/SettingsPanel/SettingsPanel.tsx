import { Box, ScrollArea, Tabs } from '@mantine/core'
import { useState } from 'react'
import DebugTag from './DebugTab'
import MapTab from './MapTab'
import RoundTab from './RoundTab'
import UnitsTab from './UnitsTab'
import WindowTab from './WindowTab'

export default function SettingsPanel() {
	const [activeTab, setActiveTab] = useState('units')

	return (
		<Box
			w={620}
			pos='absolute'
			top={0}
			right={0}
			h='100vh'
			bg='dark.6'
			p='md'
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
					<Tabs.Tab value='units'>
						Units
					</Tabs.Tab>
					<Tabs.Tab value='round'>
						Round
					</Tabs.Tab>
					<Tabs.Tab value='map'>
						Map
					</Tabs.Tab>
					<Tabs.Tab value='window'>
						Windows
					</Tabs.Tab>
					<Tabs.Tab value='debug'>
						Debug
					</Tabs.Tab>
				</Tabs.List>

				{/*
					36px = tab list
					32px = padding
				*/}
				<ScrollArea h='calc(100vh - 36px - 32px)'>
					<Tabs.Panel value='units'>
						<UnitsTab />
					</Tabs.Panel>
					<Tabs.Panel value='round'>
						<RoundTab />
					</Tabs.Panel>
					<Tabs.Panel value='map'>
						<MapTab />
					</Tabs.Panel>
					<Tabs.Panel value='window'>
						<WindowTab />
					</Tabs.Panel>
					<Tabs.Panel value='debug'>
						<DebugTag />
					</Tabs.Panel>
				</ScrollArea>
			</Tabs>
		</Box>
	)
}
