import { Stack, Title } from '@mantine/core'
import baseRunes from '~/data/baseRunes'
import { Action, Runes, Slot } from './HeroActions'
import { useHeroWindowContext } from './HeroWindowContext'

export default function HeroRunes() {
	const heroData = useHeroWindowContext()

	return (
		<Stack>
			<Stack>
				<Slot slot='PRIMARY'>
					<Action
						runeData={baseRunes['Basic Attack']}
						tooltipText='Basic Attack'
					/>

					<Action
						runeData={baseRunes.Inspire}
						tooltipText='Inspire'
					/>

					<Action
						runeData={baseRunes.Rest}
						tooltipText='Rest'
					/>

					<Title order={5}>Runes</Title>
					<Runes runes={heroData.runes.PRIMARY} />
				</Slot>

				<Slot slot='SECONDARY'>
					<Action
						runeData={baseRunes.Interact}
						tooltipText='Interact'
					/>

					<Action
						runeData={baseRunes.Rush}
						tooltipText='Rush'
					/>

					<Action
						runeData={baseRunes.Item}
						tooltipText='Use an item'
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
