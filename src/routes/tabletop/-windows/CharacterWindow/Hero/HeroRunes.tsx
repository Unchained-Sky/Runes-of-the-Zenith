import { Stack, Text, Title } from '@mantine/core'
import baseRunes from '~/data/baseRunes'
import { useArchetypeQuery } from '~/hooks/data/useArchetypeQuery'
import { type RuneData } from '~/scripts/data/runes/runeData'
import { CharacterRune, RuneCard } from '../CharacterRunes'
import { useHeroWindowContext } from './HeroWindowContext'

export default function HeroRunes() {
	const heroData = useHeroWindowContext()

	return (
		<Stack>
			<RuneCard title='PRIMARY'>
				<CharacterRune runeData={baseRunes['Basic Attack']} />
				<CharacterRune runeData={baseRunes.Inspire} />
				<CharacterRune runeData={baseRunes.Rest} />
				<Title order={5}>Runes</Title>
				<Runes runes={heroData.runes.PRIMARY} />
			</RuneCard>

			<RuneCard title='SECONDARY'>
				<CharacterRune runeData={baseRunes.Interact} />
				<CharacterRune runeData={baseRunes.Rush} />
				<CharacterRune runeData={baseRunes.Item} />
				<Title order={5}>Runes</Title>
				<Runes runes={heroData.runes.SECONDARY} />
			</RuneCard>

			<RuneCard title='PASSIVE'>
				<Runes runes={heroData.runes.PASSIVE} />
			</RuneCard>
		</Stack>
	)
}

type RunesProps = {
	runes: RuneData[]
}

function Runes({ runes }: RunesProps) {
	const subarchetypes = useArchetypeQuery()

	return runes.length
		? runes.map(runeData => {
			const subarchetype = subarchetypes[runeData.subarchetype]
			return (
				<CharacterRune
					key={runeData.name}
					runeData={runeData}
					inlineDescription={(
						<>
							<Stack gap={0}>
								<Text>{runeData.name}</Text>
								<Text size='xs'>{subarchetype.damageType} / {subarchetype.archetype} / {runeData.subarchetype}</Text>
							</Stack>
							<Text>{runeData.durability}</Text>
							<Text>{runeData.data.resolve}</Text>
						</>
					)}
				/>
			)
		})
		: <Text fs='italic'>None</Text>
}
