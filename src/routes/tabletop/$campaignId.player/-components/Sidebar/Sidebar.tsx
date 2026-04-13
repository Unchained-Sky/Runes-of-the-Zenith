import { Box, Chip, Group, Stack, Text, Title } from '@mantine/core'
import { type TabletopHeroesList, useTabletopHeroList } from '~/routes/tabletop/-hooks/tabletopData/useTabletopHeroList'
import { useWindowsStore } from '~/routes/tabletop/-windows/useWindowsStore'
import { useSupabase } from '~/supabase/useSupabase'

export default function Sidebar() {
	return (
		<Box
			miw={360}
			pos='absolute'
			top={0}
			right={0}
			h='100vh'
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

type ActiveHero = TabletopHeroesList[number] & { tabletopCharacterId: number }

function CharacterChips() {
	const { data: heroList } = useTabletopHeroList()
	const { userId } = useSupabase()

	const isOwnedActiveHero = (hero: TabletopHeroesList[number]): hero is ActiveHero => hero.userId === userId && !!hero.tabletopCharacterId
	const ownedHeroes = heroList.filter(isOwnedActiveHero)

	const opened = useWindowsStore(state => state.opened)
	const toggleWindow = useWindowsStore(state => state.toggleWindow)

	return (
		<>
			<Text>Characters</Text>
			<Chip.Group multiple>
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
			</Chip.Group>
		</>
	)
}

function GameChips() {
	const opened = useWindowsStore(state => state.opened)
	const toggleWindow = useWindowsStore(state => state.toggleWindow)

	return (
		<>
			<Text>Game</Text>
			<Chip.Group multiple>
				<Group>
					<Chip
						value='rounds'
						checked={opened.round}
						onChange={() => toggleWindow('round')}
					>
						Rounds
					</Chip>
				</Group>
			</Chip.Group>
		</>
	)
}
