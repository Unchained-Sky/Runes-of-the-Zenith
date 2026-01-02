import { ActionIcon, Card, Group, Stack, Text, Title, Tooltip } from '@mantine/core'
import { IconFlame } from '@tabler/icons-react'
import { type Enums } from '~/supabase/databaseTypes'
import { titleCase, type TitleCase } from '~/utils/stringCase'
import { type TabletopHeroRuneData, useTabletopHeroes } from '../../../-hooks/tabletopData/useTabletopHeroes'
import { useSettingsPanelStore } from '../useSettingsPanelStore'

export default function Hero() {
	const [selectedCharacterId] = useSettingsPanelStore(state => state.selectedCharacter)
	const { data: heroesData } = useTabletopHeroes()
	const heroData = heroesData[selectedCharacterId]
	if (!heroData) return null

	return (
		<Stack>
			<Title order={3}>{heroData.heroName}</Title>

			<Stack>
				<RuneSlot slot='Primary' runes={heroData.runes.PRIMARY} />
				<RuneSlot slot='Secondary' runes={heroData.runes.SECONDARY} />
				<RuneSlot slot='Passive' runes={heroData.runes.PASSIVE} />
			</Stack>
		</Stack>
	)
}

type RuneSlotProps = {
	slot: TitleCase<Enums<'rune_slot'>>
	runes: TabletopHeroRuneData[]
}

function RuneSlot({ slot, runes }: RuneSlotProps) {
	return (
		<Card component={Stack} bg='dark.5'>
			<Title order={4}>{slot}</Title>
			{
				runes.length
					? runes.map(rune => {
						return <Rune key={rune.name} runeData={rune} />
					})
					: <Text fs='italic'>None</Text>
			}
		</Card>
	)
}

type RuneProps = {
	runeData: TabletopHeroRuneData
}

function Rune({ runeData }: RuneProps) {
	return (
		<Group>
			<Tooltip label={`Cast ${runeData.name}`} color='gray'>
				<ActionIcon variant='subtle'>
					<IconFlame />
				</ActionIcon>
			</Tooltip>
			<Stack gap={0}>
				<Text>{runeData.name}</Text>
				<Text size='xs'>{titleCase(runeData.damageType)} / {runeData.archetype} / {runeData.subarchetype}</Text>
			</Stack>
			<Text>{runeData.durability ? runeData.durability : '∞'}</Text>
		</Group>
	)
}
