import { ActionIcon, Card, Code, Collapse, Group, Stack, Text, Title, Tooltip } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { IconChevronDown, IconFlame } from '@tabler/icons-react'
import { type ReactNode } from 'react'
import { type TabletopHeroRuneData } from '~/routes/tabletop/$campaignId.gm/-hooks/tabletopData/useTabletopHeroes'
import { useAssignNextHeroTurn } from '~/routes/tabletop/$campaignId.gm/-utils/assignNextHeroTurn'
import { type Enums } from '~/supabase/databaseTypes'
import { titleCase } from '~/utils/stringCase'
import { useSettingsPanelStore } from '../../useSettingsPanelStore'

type SlotProps = {
	slot: Enums<'rune_slot'>
	children: ReactNode
}

export function Slot({ slot, children }: SlotProps) {
	return (
		<Card component={Stack} bg='dark.5'>
			<Title order={4}>{titleCase(slot)}</Title>
			{children}
		</Card>
	)
}

type ActionProps = {
	tooltipText: string
	usedTurn: boolean
	slot: Enums<'rune_slot'>
	onAction: () => undefined
	inlineDescription: ReactNode
	expandedDescription: ReactNode
}

export function Action({ tooltipText, usedTurn, slot, onAction, inlineDescription, expandedDescription }: ActionProps) {
	const [selectedCharacterId] = useSettingsPanelStore(state => state.selectedCharacter)

	const assignNextTurn = useAssignNextHeroTurn()
	const handleClick = () => {
		if (slot !== 'PASSIVE') {
			assignNextTurn.mutate({ data: { tabletopCharacterId: selectedCharacterId, turnType: slot } })
		}

		onAction()
	}

	const [opened, { toggle }] = useDisclosure(false)

	return (
		<Stack>
			<Group justify='space-between'>
				<Group>
					<Tooltip label={tooltipText}>
						<ActionIcon variant='subtle' disabled={usedTurn} onClick={handleClick}>
							<IconFlame />
						</ActionIcon>
					</Tooltip>
					{inlineDescription}
				</Group>
				<ActionIcon variant='transparent' onClick={toggle}>
					<IconChevronDown
						style={{
							transition: 'transform 0.2s ease-in-out',
							transform: opened ? 'rotate(180deg)' : 'rotate(0deg)'
						}}
					/>
				</ActionIcon>
			</Group>
			<Collapse in={opened} ml={44}>
				{expandedDescription}
			</Collapse>
		</Stack>
	)
}

type RunesProps = {
	runes: TabletopHeroRuneData[]
	usedTurn: boolean
}

export function Runes({ runes, usedTurn }: RunesProps) {
	return runes.length
		? runes.map(rune => {
			return <Rune key={rune.name} runeData={rune} usedTurn={usedTurn} />
		})
		: <Text fs='italic'>None</Text>
}

type RuneProps = {
	runeData: TabletopHeroRuneData
	usedTurn: boolean
}

function Rune({ runeData, usedTurn }: RuneProps) {
	return (
		<Action
			tooltipText={`Cast ${runeData.name}`}
			slot={runeData.slot}
			usedTurn={usedTurn}
			onAction={() => undefined}
			inlineDescription={(
				<>
					<Stack gap={0}>
						<Text>{runeData.name}</Text>
						<Text size='xs'>{titleCase(runeData.damageType)} / {runeData.archetype} / {runeData.subarchetype}</Text>
					</Stack>
					<Text>{runeData.durability ? runeData.durability : '∞'}</Text>
				</>
			)}
			expandedDescription={(
				<Stack>
					<Code>{JSON.stringify(runeData.data, null, 2)}</Code>
				</Stack>
			)}
		/>
	)
}
