import { Avatar, Group, Stack, Title } from '@mantine/core'
import baseRunes from '~/data/baseRunes'
import CharacterTokens from '../CharacterTokens'
import { Action, Runes, Slot } from './HeroActions'
import { useHeroWindowContext } from './HeroWindowContext'

export default function Hero() {
	const heroData = useHeroWindowContext()

	return (
		<Stack>
			<Group>
				<Avatar src={heroData.avatarUrl} name={heroData.heroName} color='green' />
				<Title order={3}>{heroData.heroName}</Title>
			</Group>

			<CharacterTokens tabletopCharacterId={heroData.tabletopCharacterId} tokens={heroData.tokens} characterType='HERO' />

			<Stack>
				<Slot slot='PRIMARY'>
					<Action
						runeData={baseRunes['Basic Attack']}
						tooltipText='Basic Attack'
						onAction={() => undefined}
					/>

					<Action
						runeData={baseRunes.Inspire}
						tooltipText='Inspire'
						onAction={() => undefined}
					/>

					<Action
						runeData={baseRunes.Rest}
						tooltipText='Rest'
						onAction={() => undefined}
					/>

					<Title order={5}>Runes</Title>
					<Runes runes={heroData.runes.PRIMARY} />
				</Slot>

				<Slot slot='SECONDARY'>
					<Action
						runeData={baseRunes.Interact}
						tooltipText='Interact'
						onAction={() => undefined}
					/>

					<Action
						runeData={baseRunes.Rush}
						tooltipText='Rush'
						onAction={() => undefined}
					/>

					<Action
						runeData={baseRunes.Item}
						tooltipText='Use an item'
						onAction={() => undefined}
					/>

					<Title order={5}>Runes</Title>
					<Runes runes={heroData.runes.SECONDARY} />
				</Slot>

				<Slot slot='PASSIVE'>
					<Runes runes={heroData.runes.PASSIVE} />
				</Slot>
			</Stack>
		</Stack>
	)
}
