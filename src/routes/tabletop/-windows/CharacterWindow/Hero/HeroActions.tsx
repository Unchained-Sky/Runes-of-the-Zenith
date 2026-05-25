import { ActionIcon, Card, Code, Collapse, Group, Stack, Text, Title, Tooltip } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { IconChevronDown, IconFlame } from '@tabler/icons-react'
import { type ReactNode } from 'react'
import { useArchetypeQuery } from '~/hooks/data/useArchetypeQuery'
import { type RuneData } from '~/scripts/data/runes/runeData'
import { type Enums } from '~/supabase/databaseTypes'
import { useConfirmTargetStore } from '~/tt/-windows/ConfirmTargetWindow/useConfirmTargetStore'
import { titleCase } from '~/utils/stringCase'
import { useHeroWindowContext } from './HeroWindowContext'

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
	runeData: RuneData
	tooltipText: string
	inlineDescription?: ReactNode
	expandedDescription?: ReactNode
}

export function Action({ runeData, tooltipText, inlineDescription, expandedDescription }: ActionProps) {
	const heroData = useHeroWindowContext()

	const open = useConfirmTargetStore(state => state.open)

	const targetRune = () => {
		open({
			tabletopCharacterId: heroData.tabletopCharacterId,
			tabletopCharacterType: 'HERO',
			runeData
		})
	}

	const [opened, { toggle }] = useDisclosure(false)

	const usedTurn = runeData.slot === 'PASSIVE' ? false : heroData.turn[runeData.slot].used

	return (
		<Stack>
			<Group justify='space-between'>
				<Group>
					<Tooltip label={tooltipText}>
						<ActionIcon variant='subtle' disabled={usedTurn} onClick={targetRune}>
							<IconFlame />
						</ActionIcon>
					</Tooltip>
					{inlineDescription ?? <Text>{runeData.name}</Text>}
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
			<Collapse expanded={opened} ml={44}>
				<Stack gap={0}>
					{expandedDescription ?? <Text>{runeData.data.description}</Text>}
					<Code>{JSON.stringify(runeData.data.effect, null, 2)}</Code>
				</Stack>
			</Collapse>
		</Stack>
	)
}

type RunesProps = {
	runes: RuneData[]
}

export function Runes({ runes }: RunesProps) {
	return runes.length
		? runes.map(rune => {
			return <Rune key={rune.name} runeData={rune} />
		})
		: <Text fs='italic'>None</Text>
}

type RuneProps = {
	runeData: RuneData
}

function Rune({ runeData }: RuneProps) {
	const subarchetypes = useArchetypeQuery()
	const subarchetype = subarchetypes[runeData.subarchetype]

	return (
		<Action
			runeData={runeData}
			tooltipText={`Cast ${runeData.name}`}
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
			expandedDescription={(
				<Stack>
					{}
				</Stack>
			)}
		/>
	)
}
