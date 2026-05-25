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
					<Action runeData={baseRunes['Basic Attack']} />

					<Action runeData={baseRunes.Inspire} />

					<Action runeData={baseRunes.Rest} />

					<Title order={5}>Runes</Title>
					<Runes runes={heroData.runes.PRIMARY} />
				</Slot>

				<Slot slot='SECONDARY'>
					<Action runeData={baseRunes.Interact} />

					<Action runeData={baseRunes.Rush} />

					<Action runeData={baseRunes.Item} />

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
