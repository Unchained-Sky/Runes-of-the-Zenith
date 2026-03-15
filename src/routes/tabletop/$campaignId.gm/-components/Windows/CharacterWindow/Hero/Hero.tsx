import { Avatar, Group, Stack, Text, Title } from '@mantine/core'
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
						tooltipText='Basic Attack'
						slot='PRIMARY'
						onAction={() => undefined}
						inlineDescription={<Text>Basic Attack</Text>}
						expandedDescription={<Text>Basic Attack</Text>}
					/>

					<Action
						tooltipText='Inspire'
						slot='PRIMARY'
						onAction={() => undefined}
						inlineDescription={<Text>Inspire</Text>}
						expandedDescription={<Text>Inspire</Text>}
					/>

					<Action
						tooltipText='Rest'
						slot='PRIMARY'
						onAction={() => undefined}
						inlineDescription={<Text>Rest</Text>}
						expandedDescription={<Text>Rest</Text>}
					/>

					<Title order={5}>Runes</Title>
					<Runes runes={heroData.runes.PRIMARY} />
				</Slot>

				<Slot slot='SECONDARY'>
					<Action
						tooltipText='Interact'
						slot='SECONDARY'
						onAction={() => undefined}
						inlineDescription={<Text>Interact</Text>}
						expandedDescription={<Text>Interact</Text>}
					/>

					<Action
						tooltipText='Rush'
						slot='SECONDARY'
						onAction={() => undefined}
						inlineDescription={<Text>Rush</Text>}
						expandedDescription={<Text>Rush</Text>}
					/>

					<Action
						tooltipText='Use an item'
						slot='SECONDARY'
						onAction={() => undefined}
						inlineDescription={<Text>Item</Text>}
						expandedDescription={<Text>Item</Text>}
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
