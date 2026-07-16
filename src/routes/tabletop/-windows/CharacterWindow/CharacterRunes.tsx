import { ActionIcon, Card, Collapse, Group, List, Menu, Stack, Text, Title } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { IconChevronDown, IconFlame, IconSettings } from '@tabler/icons-react'
import { type ReactNode } from 'react'
import { type Enums } from '~/supabase/databaseTypes'
import { type EnemyRuneExtraData } from '~/supabase/extraDataFormatter/enemyRuneExtraData'
import { type RuneExtraData } from '~/supabase/extraDataFormatter/runeExtraData'
import { capitalise, titleCase } from '~/utils/stringCase'
import { type TabletopEnemyRuneData, type TabletopGMEnemyData } from '../../$campaignId.gm/-hooks/tabletopData/useGMTabletopEnemies'
import { type TabletopHeroData, type TabletopRuneData } from '../../-hooks/tabletopData/useTabletopHeroes'
import { useUpdateRuneState } from '../../-utils/gameActions/updateRuneState'
import { useConfirmTargetStore } from '../ConfirmTargetWindow/useConfirmTargetStore'
import useCharacterWindowContext from './useCharacterWindowContext'

type RuneCardProps = {
	title: Enums<'rune_slot'>
	children: ReactNode
}

export function RuneCard({ title, children }: RuneCardProps) {
	return (
		<Card component={Stack} bg='dark.5'>
			<Title order={4}>{titleCase(title)}</Title>
			{children}
		</Card>
	)
}

type CharacterRuneProps = {
	runeData: TabletopRuneData | TabletopEnemyRuneData
	inlineDescription?: ReactNode
}

export function CharacterRune({ runeData, inlineDescription }: CharacterRuneProps) {
	const characterData = useCharacterWindowContext()

	const assertRuneType = (_runeData: TabletopRuneData | TabletopEnemyRuneData): _runeData is TabletopRuneData => {
		return characterData.characterType === 'HERO'
	}

	switch (characterData.characterType) {
		case 'HERO': {
			if (!assertRuneType(runeData)) return null
			return (
				<CharacterRuneInner
					characterType='HERO'
					characterData={characterData}
					runeData={runeData}
					inlineDescription={inlineDescription}
				/>
			)
		}
		case 'ENEMY': {
			if (assertRuneType(runeData)) return null
			return (
				<CharacterRuneInner
					characterType='ENEMY'
					characterData={characterData}
					runeData={runeData}
					inlineDescription={inlineDescription}
				/>
			)
		}
	}
}

type CharacterRuneInnerProps = ({
	characterType: 'HERO'
	characterData: TabletopHeroData & { characterType: 'HERO' }
	runeData: TabletopRuneData
} | {
	characterType: 'ENEMY'
	characterData: TabletopGMEnemyData & { characterType: 'ENEMY' }
	runeData: TabletopEnemyRuneData
}) & {
	inlineDescription?: ReactNode
}

function CharacterRuneInner({ characterType, characterData, runeData, inlineDescription }: CharacterRuneInnerProps) {
	const open = useConfirmTargetStore(state => state.open)

	const targetRune = () => {
		if (characterType === 'HERO') {
			open({
				tabletopCharacterId: characterData.tabletopCharacterId,
				tabletopCharacterType: 'HERO',
				runeData
			})
		} else {
			open({
				tabletopCharacterId: characterData.tabletopCharacterId,
				tabletopCharacterType: 'ENEMY',
				runeData
			})
		}
	}

	const [opened, { toggle }] = useDisclosure(false)

	const usedTurn = (() => {
		if (runeData.slot === 'PASSIVE') return false
		return characterType === 'HERO'
			? characterData.turn[runeData.slot].used
			: runeData.slot === 'PRIMARY' && characterData.tabletopStats.usedPrimary
	})()

	return (
		<Stack>
			<Group justify='space-between'>
				<Group flex={1}>
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
				<Card>
					<Group gap={0} justify='space-between' align='flex-end'>
						<Stack gap={0}>
							<Text>{runeData.data.description}</Text>
							{runeData.data.effect.map((effect, index) => {
								return (
									<RuneEffectDescription
										key={index}
										effect={effect}
										hasMultipleEffects={runeData.data.effect.length > 1}
										index={index}
									/>
								)
							})}
						</Stack>

						<RuneSettings runeData={runeData} />
					</Group>
				</Card>
			</Collapse>
		</Stack>
	)
}

type RuneEffectDescriptionProps = {
	effect: RuneExtraData['effect'][number] | EnemyRuneExtraData['effect'][number]
	hasMultipleEffects: boolean
	index: number
}

function RuneEffectDescription({ effect, hasMultipleEffects, index }: RuneEffectDescriptionProps) {
	return (
		<>
			{hasMultipleEffects && <Text size='sm' mt='xs'>Effect - {index + 1}</Text>}
			<List size='sm'>
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
		</>
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

type RuneSettingsProps = {
	runeData: TabletopRuneData | TabletopEnemyRuneData
}

function RuneSettings({ runeData }: RuneSettingsProps) {
	const characterData = useCharacterWindowContext()

	const updateRuneState = useUpdateRuneState()

	const currentState = runeData.currentDurability ?? runeData.durability

	const assertRuneType = (_runeData: TabletopRuneData | TabletopEnemyRuneData): _runeData is TabletopRuneData => {
		return characterData.characterType === 'HERO'
	}

	const DurabilityItem = ({ runeState }: { runeState: Enums<'rune_durability'> }) => {
		return (
			<Menu.Item
				onClick={() => {
					updateRuneState.mutate({
						data: {
							tabletopCharacterId: characterData.tabletopCharacterId,
							runes: [{
								runeName: runeData.name,
								runeState
							}]
						}
					})
				}}
				disabled={currentState === runeState}
			>
				{capitalise(runeState)}
			</Menu.Item>
		)
	}

	return (
		<Menu position='right'>
			<Menu.Target>
				<ActionIcon variant='subtle'>
					<IconSettings />
				</ActionIcon>
			</Menu.Target>

			<Menu.Dropdown>
				{assertRuneType(runeData) && runeData.subarchetype === 'BASE'
					? <Menu.Item disabled>Durability</Menu.Item>
					: (
						<Menu.Sub>
							<Menu.Sub.Target>
								<Menu.Sub.Item>Durability</Menu.Sub.Item>
							</Menu.Sub.Target>
							<Menu.Sub.Dropdown>
								<DurabilityItem runeState='REINFORCED' />
								<DurabilityItem runeState='STABLE' />
								<DurabilityItem runeState='UNSTABLE' />
								<DurabilityItem runeState='FRAGILE' />
								<DurabilityItem runeState='BROKEN' />
							</Menu.Sub.Dropdown>
						</Menu.Sub>
					)}
			</Menu.Dropdown>
		</Menu>
	)
}
