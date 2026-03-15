import { LineChart } from '@mantine/charts'
import { ActionIcon, Card, Code, Collapse, Group, Stack, Text, Title, Tooltip } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { IconChevronDown, IconFlame } from '@tabler/icons-react'
import { type ReactNode } from 'react'
import { type TabletopHeroRuneData } from '~/routes/tabletop/$campaignId.gm/-hooks/tabletopData/useTabletopHeroes'
import { useAssignNextHeroTurn } from '~/routes/tabletop/$campaignId.gm/-utils/assignNextHeroTurn'
import { TEST_DATA } from '~/scripts/chart/damageData'
import { type RuneExtraData } from '~/scripts/data/runes/runeData'
import { type Enums } from '~/supabase/databaseTypes'
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
	tooltipText: string
	slot: Enums<'rune_slot'>
	onAction: () => undefined
	inlineDescription: ReactNode
	expandedDescription: ReactNode
}

export function Action({ tooltipText, slot, onAction, inlineDescription, expandedDescription }: ActionProps) {
	const heroData = useHeroWindowContext()

	const assignNextTurn = useAssignNextHeroTurn()
	const handleClick = () => {
		if (slot !== 'PASSIVE') {
			assignNextTurn.mutate({
				data: {
					tabletopCharacterId: heroData.tabletopCharacterId,
					turnType: slot
				}
			})
		}

		onAction()
	}

	const [opened, { toggle }] = useDisclosure(false)

	const usedTurn = slot === 'PASSIVE' ? true : (heroData.turn?.[slot].used ?? false)

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
}

export function Runes({ runes }: RunesProps) {
	return runes.length
		? runes.map(rune => {
			return <Rune key={rune.name} runeData={rune} />
		})
		: <Text fs='italic'>None</Text>
}

type RuneProps = {
	runeData: TabletopHeroRuneData
}

function Rune({ runeData }: RuneProps) {
	const heroData = useHeroWindowContext()
	const heroStats = {
		int: heroData.stats.int,
		dex: heroData.stats.dex,
		str: heroData.stats.str
	}

	return (
		<Action
			tooltipText={`Cast ${runeData.name}`}
			slot={runeData.slot}
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
					{runeData.data.damage && (
						<ActionDamageChart
							damageType={runeData.data.damage.damageType}
							accuracy={runeData.data.damage.accuracy}
							heroStats={heroStats}
						/>
					)}
				</Stack>
			)}
		/>
	)
}

type RuneExtraDataDamage = NonNullable<RuneExtraData['damage']>
type ActionDamageChartProps = {
	damageType: RuneExtraDataDamage['damageType']
	accuracy: RuneExtraDataDamage['accuracy']
	heroStats: {
		int: number
		dex: number
		str: number
	}
}

function ActionDamageChart({ damageType, accuracy: _acc, heroStats }: ActionDamageChartProps) {
	const intDamage = damageType.int ? damageType.int.flat + (damageType.int.scale * heroStats.int / 100) : 0
	const dexDamage = damageType.dex ? damageType.dex.flat + (damageType.dex.scale * heroStats.dex / 100) : 0
	const strDamage = damageType.str ? damageType.str.flat + (damageType.str.scale * heroStats.str / 100) : 0
	const maxHit = intDamage + dexDamage + strDamage

	const damageData: Record<number, { damage: number, Average: number, Squishy: number, Tanky: number }> = {}
	const exampleMin = TEST_DATA[0]?.damage ?? 0
	const exampleMax = TEST_DATA[TEST_DATA.length - 1]?.damage ?? 0
	const diff = exampleMax + exampleMin - maxHit
	TEST_DATA.forEach(({ damage, percentage }, i) => {
		const hit = Math.round((100 - (100 / (exampleMax / diff))) / 100 * damage)
		damageData[hit] = {
			damage: hit,
			Average: percentage,
			Squishy: TEST_DATA[i - ~~(TEST_DATA.length / 3)]?.percentage ?? 0,
			Tanky: TEST_DATA[i + ~~(TEST_DATA.length / 3)]?.percentage ?? 0
		}
	})

	return (
		<LineChart
			h={300}
			data={Object.values(damageData)}
			dataKey='damage'
			series={[
				{ name: 'Squishy', color: 'green' },
				{ name: 'Average', color: 'blue' },
				{ name: 'Tanky', color: 'red' }
			]}
			withLegend={true}
			withTooltip={false}
			dotProps={{ r: 0 }}
			activeDotProps={{ r: 0 }}
			strokeWidth={3}
			xAxisLabel='Damage Dealt'
			yAxisLabel='Percent Chance'
			yAxisProps={{ domain: [0, 4] }}
			referenceLines={[
				{ x: ~~(maxHit / 1.2), label: 'Average Hit', stroke: 'green', strokeWidth: 2, strokeDasharray: '3 3' },
				{ x: ~~(maxHit / 2), label: 'Average Hit', stroke: 'blue', strokeWidth: 2, strokeDasharray: '3 3' },
				{ x: ~~(maxHit / 6), label: 'Average Hit', stroke: 'red', strokeWidth: 2, strokeDasharray: '3 3' }
			]}
			valueFormatter={value => `${value}%`}
		/>
	)
}
