import { Avatar, Group, Stack, Tabs, Text, Title } from '@mantine/core'
import CharacterLingering from '../CharacterLingering'
import CharacterStats from '../CharacterStats'
import CharacterTokens from '../CharacterTokens'
import { useEnemyWindowContext } from './EnemyWindowContext'

export default function Enemy() {
	const enemyData = useEnemyWindowContext()

	return (
		<Stack>
			<Group>
				<Avatar name={enemyData.enemyName} color='red' />
				<Title order={3}>{enemyData.enemyName}</Title>
			</Group>

			<Tabs defaultValue='stats'>
				<Tabs.List mb='md'>
					<Tabs.Tab value='stats'>Stats</Tabs.Tab>
					<Tabs.Tab value='runes'>Runes</Tabs.Tab>
				</Tabs.List>

				<Tabs.Panel value='stats'>
					<Stack>
						<CharacterStats />
						<CharacterTokens />
						<CharacterLingering />
					</Stack>
				</Tabs.Panel>

				<Tabs.Panel value='runes'>
					<Text>Runes</Text>
				</Tabs.Panel>
			</Tabs>
		</Stack>
	)
}
