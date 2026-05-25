import { ActionIcon, Card, Collapse, Group, List, Stack, Text, Title } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { IconChevronDown, IconFlame } from '@tabler/icons-react'
import { Fragment, type ReactNode } from 'react'
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
	inlineDescription?: ReactNode
}

export function Action({ runeData, inlineDescription }: ActionProps) {
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
					<ActionIcon variant='subtle' disabled={usedTurn} onClick={targetRune}>
						<IconFlame />
					</ActionIcon>
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
			<Collapse expanded={opened}>
				<Card component={Stack} gap={0}>
					<Text>{runeData.data.description}</Text>
					{runeData.data.effect.map((effect, index) => {
						return (
							<Fragment key={index}>
								{runeData.data.effect.length > 1 && <Text size='sm' mt='xs'>Effect - {index + 1}</Text>}
								<List key={index} size='sm'>
									<List.Item>Target - {effect.target.selectType} {effect.target.characterType} {effect.target.amount}</List.Item>
									{effect.range && <List.Item>Range - {effect.range}</List.Item>}
									{effect.aoe && <List.Item>AoE - {effect.aoe}</List.Item>}
									{effect.damage && (
										<List.Item>
											{'Damage - '}
											<DamageValue value={effect.damage.mainStats.int} color='blue' />
											{effect.damage.mainStats.int && (effect.damage.mainStats.dex || effect.damage.mainStats.str) && ' + '}
											<DamageValue value={effect.damage.mainStats.dex} color='green' />
											{effect.damage.mainStats.dex && effect.damage.mainStats.str && ' + '}
											<DamageValue value={effect.damage.mainStats.str} color='red' />
											{` - [${effect.damage.accuracy}% accuracy]`}
										</List.Item>
									)}
									{effect.healing && (
										<List.Item>
											{'Healing - '}
											<DamageValue value={effect.healing.mainStats.int} color='blue' />
											{effect.healing.mainStats.int && (effect.healing.mainStats.dex || effect.healing.mainStats.str) && ' + '}
											<DamageValue value={effect.healing.mainStats.dex} color='green' />
											{effect.healing.mainStats.dex && effect.healing.mainStats.str && ' + '}
											<DamageValue value={effect.healing.mainStats.str} color='red' />
											{` - [${effect.healing.accuracy}% accuracy]`}
										</List.Item>
									)}
								</List>
							</Fragment>
						)
					})}
				</Card>
			</Collapse>
		</Stack>
	)
}

type DamageValueProps = {
	value?: {
		flat: number
		scale: number
	}
	color: 'blue' | 'green' | 'red'
}

function DamageValue({ value, color }: DamageValueProps) {
	return value
		? <Text span c={color} size='sm'>{value.flat}+{value.scale}%</Text>
		: null
}

type RunesProps = {
	runes: RuneData[]
}

export function Runes({ runes }: RunesProps) {
	const subarchetypes = useArchetypeQuery()

	return runes.length
		? runes.map(runeData => {
			const subarchetype = subarchetypes[runeData.subarchetype]
			return (
				<Action
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
