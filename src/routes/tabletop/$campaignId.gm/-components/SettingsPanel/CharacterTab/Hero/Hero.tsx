import { Avatar, Group, Stack, Text, Title } from '@mantine/core'
import { useTabletopHeroes } from '../../../../-hooks/tabletopData/useTabletopHeroes'
import { useSettingsPanelStore } from '../../useSettingsPanelStore'
import CharacterTokens from '../CharacterTokens'
import { Action, Runes, Slot } from './HeroActions'

export default function Hero() {
	const [selectedCharacterId] = useSettingsPanelStore(state => state.selectedCharacter)
	const { data: heroesData } = useTabletopHeroes()
	const heroData = heroesData[selectedCharacterId]
	if (!heroData) return null

	const usedTurnPrimary = heroData.turn?.PRIMARY.used ?? false
	const usedTurnSecondary = heroData.turn?.SECONDARY.used ?? false

	return (
		<Stack>
			<Group>
				<Avatar src={heroData.avatarUrl} name={heroData.heroName} color='green' />
				<Title order={3}>{heroData.heroName}</Title>
			</Group>

			<CharacterTokens tokens={heroData.tokens} characterType='HERO' />

			<Stack>
				<Slot slot='PRIMARY'>
					<Action
						tooltipText='Basic Attack'
						slot='PRIMARY'
						usedTurn={usedTurnPrimary}
						onAction={() => undefined}
						inlineDescription={<Text>Basic Attack</Text>}
						expandedDescription={<Text>Basic Attack</Text>}
					/>

					<Action
						tooltipText='Inspire'
						slot='PRIMARY'
						usedTurn={usedTurnPrimary}
						onAction={() => undefined}
						inlineDescription={<Text>Inspire</Text>}
						expandedDescription={<Text>Inspire</Text>}
					/>

					<Action
						tooltipText='Rest'
						slot='PRIMARY'
						usedTurn={usedTurnPrimary}
						onAction={() => undefined}
						inlineDescription={<Text>Rest</Text>}
						expandedDescription={<Text>Rest</Text>}
					/>

					<Title order={5}>Runes</Title>
					<Runes runes={heroData.runes.PRIMARY} usedTurn={usedTurnPrimary} />
				</Slot>

				<Slot slot='SECONDARY'>
					<Action
						tooltipText='Interact'
						slot='SECONDARY'
						usedTurn={usedTurnSecondary}
						onAction={() => undefined}
						inlineDescription={<Text>Interact</Text>}
						expandedDescription={<Text>Interact</Text>}
					/>

					<Action
						tooltipText='Rush'
						slot='SECONDARY'
						usedTurn={usedTurnSecondary}
						onAction={() => undefined}
						inlineDescription={<Text>Rush</Text>}
						expandedDescription={<Text>Rush</Text>}
					/>

					<Action
						tooltipText='Use an item'
						slot='SECONDARY'
						usedTurn={usedTurnSecondary}
						onAction={() => undefined}
						inlineDescription={<Text>Item</Text>}
						expandedDescription={<Text>Item</Text>}
					/>

					<Title order={5}>Runes</Title>
					<Runes runes={heroData.runes.SECONDARY} usedTurn={usedTurnSecondary} />
				</Slot>

				<Slot slot='PASSIVE'>
					<Runes runes={heroData.runes.PASSIVE} usedTurn={false} />
				</Slot>
			</Stack>
		</Stack>
	)
}
