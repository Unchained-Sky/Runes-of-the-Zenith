import { Avatar, Group, Stack, Tabs, Title } from '@mantine/core'
import CharacterLingering from '../CharacterLingering'
import CharacterStats from '../CharacterStats'
import CharacterTokens from '../CharacterTokens'
import HeroRunes from './HeroRunes'
import { useHeroWindowContext } from './HeroWindowContext'

export default function Hero() {
	const heroData = useHeroWindowContext()

	return (
		<Stack>
			<Group>
				<Avatar src={heroData.avatarUrl} name={heroData.heroName} color='green' />
				<Title order={3}>{heroData.heroName}</Title>
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
					<HeroRunes />
				</Tabs.Panel>
			</Tabs>
		</Stack>
	)
}
