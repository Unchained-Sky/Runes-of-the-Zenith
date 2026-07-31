import { Box, Chip, Group, Stack, Text, Title } from '@mantine/core'
import useOwnedHeroes from '~/routes/tabletop/-hooks/useOwnedHeroes'
import { useWindowsStore } from '~/routes/tabletop/-windows/useWindowsStore'

export default function Sidebar() {
	return (
		<Box
			miw={360}
			pos='absolute'
			bottom={0}
			right={0}
			h='calc(100vh - 60px)'
			bg='dark.6'
			p='md'
		>
			<Stack>
				<Title>Sidebar</Title>
				<CharacterChips />
				<GameChips />
			</Stack>
		</Box>
	)
}

function CharacterChips() {
	const ownedHeroes = useOwnedHeroes()

	const opened = useWindowsStore(state => state.opened)
	const toggleWindow = useWindowsStore(state => state.toggleWindow)

	return (
		<>
			<Text>Characters</Text>
			<Group>
				{ownedHeroes.map(hero => {
					return (
						<Chip
							key={hero.tabletopCharacterId}
							value={hero.tabletopCharacterId.toString()}
							checked={opened[`character-HERO-${hero.tabletopCharacterId}`]}
							onChange={() => toggleWindow(`character-HERO-${hero.tabletopCharacterId}`)}
						>
							{hero.heroName}
						</Chip>
					)
				})}
			</Group>
		</>
	)
}

function GameChips() {
	const opened = useWindowsStore(state => state.opened)
	const toggleWindow = useWindowsStore(state => state.toggleWindow)

	return (
		<>
			<Text>Game</Text>
			<Group>
				<Chip
					value='rounds'
					checked={opened.round}
					onChange={() => toggleWindow('round')}
				>
					Rounds
				</Chip>
				<Chip
					value='damageSimulation'
					checked={opened.damageSimulation}
					onChange={() => toggleWindow('damageSimulation')}
				>
					Damage Simulation
				</Chip>
			</Group>
		</>
	)
}
