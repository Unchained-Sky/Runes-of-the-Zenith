import { ActionIcon, Avatar, Card, Group, Stack, Text, Title, Tooltip } from '@mantine/core'
import { IconFlame } from '@tabler/icons-react'
import { type Enums } from '~/supabase/databaseTypes'
import { titleCase } from '~/utils/stringCase'
import { type TabletopHeroRuneData, useTabletopHeroes } from '../../../-hooks/tabletopData/useTabletopHeroes'
import { useAssignNextHeroTurn } from '../../../-utils/assignNextHeroTurn'
import { useSettingsPanelStore } from '../useSettingsPanelStore'

export default function Hero() {
	const [selectedCharacterId] = useSettingsPanelStore(state => state.selectedCharacter)
	const { data: heroesData } = useTabletopHeroes()
	const heroData = heroesData[selectedCharacterId]
	if (!heroData) return null

	return (
		<Stack>
			<Group>
				<Avatar src={heroData.avatarUrl} name={heroData.heroName} color='green' />
				<Title order={3}>{heroData.heroName}</Title>
			</Group>

			<Stack>
				<RuneSlot slot='PRIMARY' runes={heroData.runes.PRIMARY} usedTurn={heroData.turn?.PRIMARY.used ?? false} tabletopCharacterId={heroData.tabletopCharacterId} />
				<RuneSlot slot='SECONDARY' runes={heroData.runes.SECONDARY} usedTurn={heroData.turn?.SECONDARY.used ?? false} tabletopCharacterId={heroData.tabletopCharacterId} />
				<RuneSlot slot='PASSIVE' runes={heroData.runes.PASSIVE} usedTurn={false} tabletopCharacterId={heroData.tabletopCharacterId} />
			</Stack>
		</Stack>
	)
}

type RuneSlotProps = {
	slot: Enums<'rune_slot'>
	runes: TabletopHeroRuneData[]
	usedTurn: boolean
	tabletopCharacterId: number
}

function RuneSlot({ slot, runes, usedTurn, tabletopCharacterId }: RuneSlotProps) {
	return (
		<Card component={Stack} bg='dark.5'>
			<Title order={4}>{titleCase(slot)}</Title>
			{
				runes.length
					? runes.map(rune => {
						return <Rune key={rune.name} runeData={rune} usedTurn={usedTurn} tabletopCharacterId={tabletopCharacterId} />
					})
					: <Text fs='italic'>None</Text>
			}
		</Card>
	)
}

type RuneProps = {
	runeData: TabletopHeroRuneData
	usedTurn: boolean
	tabletopCharacterId: number
}

function Rune({ runeData, usedTurn, tabletopCharacterId }: RuneProps) {
	const assignNextTurn = useAssignNextHeroTurn()

	const castRune = () => {
		if (runeData.slot !== 'PASSIVE') {
			assignNextTurn.mutate({ data: { tabletopCharacterId, turnType: runeData.slot } })
		}
	}

	return (
		<Group>
			<Tooltip label={`Cast ${runeData.name}`} color='gray'>
				<ActionIcon variant='subtle' disabled={usedTurn} onClick={castRune}>
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
