import { LineChart } from '@mantine/charts'
import { ActionIcon, Card, Code, Collapse, Group, Stack, Text, Title, Tooltip } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { IconChevronDown, IconFlame } from '@tabler/icons-react'
import { type ReactNode } from 'react'
import { TEST_DATA } from '~/scripts/chart/damageData'
import { type RuneData, type RuneExtraData } from '~/scripts/data/runes/runeData'
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

	const usedTurn = runeData.slot === 'PASSIVE' ? false : (heroData.turn?.[runeData.slot].used ?? false)

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
					<Code>{JSON.stringify(runeData.data, null, 2)}</Code>
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
	const heroData = useHeroWindowContext()
	const heroMainStats = {
		int: heroData.stats.int,
		dex: heroData.stats.dex,
		str: heroData.stats.str
	}

	return (
		<Action
			runeData={runeData}
			tooltipText={`Cast ${runeData.name}`}
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
					{runeData.data.damage && (
						<ActionDamageChart
							runeMainStats={runeData.data.damage.mainStats}
							accuracy={runeData.data.damage.accuracy}
							heroMainStats={heroMainStats}
						/>
					)}
				</Stack>
			)}
		/>
	)
}

type RuneExtraDataDamage = NonNullable<RuneExtraData['damage']>
type ActionDamageChartProps = {
	runeMainStats: RuneExtraDataDamage['mainStats']
	accuracy: RuneExtraDataDamage['accuracy']
	heroMainStats: {
		int: number
		dex: number
		str: number
	}
}

function ActionDamageChart({ runeMainStats, heroMainStats }: ActionDamageChartProps) {
	const intDamage = runeMainStats.int ? runeMainStats.int.flat + (runeMainStats.int.scale * heroMainStats.int / 100) : 0
	const dexDamage = runeMainStats.dex ? runeMainStats.dex.flat + (runeMainStats.dex.scale * heroMainStats.dex / 100) : 0
	const strDamage = runeMainStats.str ? runeMainStats.str.flat + (runeMainStats.str.scale * heroMainStats.str / 100) : 0
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
