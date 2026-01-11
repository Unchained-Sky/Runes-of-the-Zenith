import { ActionIcon, Avatar, Box, Card, Code, Collapse, Group, Image, Pill, Stack, Text, ThemeIcon, Title, Tooltip } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { IconChevronDown, IconFlame, type ReactNode } from '@tabler/icons-react'
import { useTokenQuery } from '~/hooks/data/useTokenQuery'
import { type Enums } from '~/supabase/databaseTypes'
import { titleCase } from '~/utils/stringCase'
import { type TabletopHeroData, type TabletopHeroRuneData, useTabletopHeroes } from '../../../-hooks/tabletopData/useTabletopHeroes'
import { useAssignNextHeroTurn } from '../../../-utils/assignNextHeroTurn'
import { useSettingsPanelStore } from '../useSettingsPanelStore'

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

			<Tokens tokens={heroData.tokens} />

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

type SlotProps = {
	slot: Enums<'rune_slot'>
	children: ReactNode
}

function Slot({ slot, children }: SlotProps) {
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

function Action({ tooltipText, usedTurn, slot, onAction, inlineDescription, expandedDescription }: ActionProps) {
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

function Runes({ runes, usedTurn }: RunesProps) {
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

type TokenProps = {
	tokens: TabletopHeroData['tokens']
}

function Tokens({ tokens }: TokenProps) {
	const tokensData = useTokenQuery()

	const getTokenColour = (alignment: Enums<'token_alignment'>) => {
		switch (alignment) {
			case 'POSITIVE':
				return 'green'
			case 'NEUTRAL':
				return 'yellow'
			case 'NEGATIVE':
				return 'red'
		}
	}

	return (
		<Card component={Stack} bg='dark.5'>
			<Title order={4}>Tokens</Title>
			<Group>
				{tokens.map(token => {
					const tokenData = tokensData[token.name]
					if (!tokenData) throw new Error(`Token ${token.name} not found`)

					return (
						<Tooltip
							key={token.name}
							label={(
								<Box>
									<Text fw='bold'>{token.name}</Text>
									<Text>{tokenData.extraData.description}</Text>
								</Box>
							)}
						>
							<Box pos='relative' id={`token-${token.name}`}>
								<ThemeIcon
									variant='light'
									color={getTokenColour(tokenData.alignment)}
									size='xl'
								>
									<Image src={`/tokenIcon/${tokenData.extraData.image}`} />
								</ThemeIcon>
								<Pill pos='absolute' bottom={0} right={-4}>{token.amount}</Pill>
							</Box>
						</Tooltip>
					)
				})}

				{tokens.length === 0 && <Text fs='italic'>None</Text>}
			</Group>
		</Card>
	)
}
