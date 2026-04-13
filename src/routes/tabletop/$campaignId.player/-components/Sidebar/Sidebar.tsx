import { Box, Chip, Group, Stack, Text, Title } from '@mantine/core'
import { useTabletopHeroList } from '~/routes/tabletop/-hooks/tabletopData/useTabletopHeroList'
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

function CharacterChips() {
	const { data: heroList } = useTabletopHeroList()
	const { userId } = useSupabase()

	const ownedHeroes = heroList.filter(hero => hero.userId === userId)

	return (
		<>
			<Text>Characters</Text>
			<Chip.Group multiple>
				<Group>
					{ownedHeroes.map(hero => {
						if (!hero.tabletopCharacterId) return
						return (
							<Chip
								key={hero.tabletopCharacterId}
								value={hero.tabletopCharacterId.toString()}
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
	return (
		<>
			<Text>Game</Text>
			<Chip.Group multiple>
				<Group>
					<Chip value='1'>Chip 1</Chip>
					<Chip value='2'>Chip 2</Chip>
					<Chip value='3'>Chip 3</Chip>
				</Group>
			</Chip.Group>
		</>
	)
}
