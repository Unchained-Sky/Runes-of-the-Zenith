import { Window } from '@gfazioli/mantine-window'
import { LineChart } from '@mantine/charts'
import { Button, Divider, Group, NumberInput, Select, Stack, Tabs, type NumberInputProps } from '@mantine/core'
import { createFormContext } from '@mantine/form'
import { useMemo, useState } from 'react'
import { type Enums } from '~/supabase/databaseTypes'
import { typedSplit } from '~/types/split'
import { damageCalculation } from '~/utils/damageCalculation'
import { int2 } from '~/utils/int'
import { useTabletopHeroes, type TabletopHeroData } from '../-hooks/tabletopData/useTabletopHeroes'
import useOwnedHeroes from '../-hooks/useOwnedHeroes'
import { DEFAULT_WINDOW_PROPS, type CustomWindowProps } from './windowHelpers'

const NUMBER_INPUT_PROPS = {
	miw: 85,
	min: int2.floor,
	max: int2.ceil
} satisfies NumberInputProps

const SECTION_HEIGHT = 140

type FormValues = {
	presets: {
		enemyPreset: string
		attackPreset: string
	}
	attackerStats: {
		int: number
		dex: number
		str: number
		critChance: number
	}
	attackStats: {
		int: [flat: number, scale: number]
		dex: [flat: number, scale: number]
		str: [flat: number, scale: number]
		accuracy: number
	}
	defenderStats: {
		intDef: number
		dexDef: number
		strDef: number
	}
}
const [FormProvider, useFormContext, useForm] = createFormContext<FormValues>()

const ENEMY_PRESETS = new Map([
	['custom', { int: 0, dex: 0, str: 0 }],
	['squishy', { int: 20, dex: 20, str: 20 }],
	['average', { int: 50, dex: 50, str: 50 }],
	['tanky', { int: 80, dex: 80, str: 80 }]
])
const getEnemyPreset = (presetName: string) => ENEMY_PRESETS.get(presetName) ?? { int: 0, dex: 0, str: 0 }

export default function DamageSimulationWindow({ opened, onClose }: CustomWindowProps) {
	const form = useForm({
		mode: 'uncontrolled',
		initialValues: {
			presets: {
				enemyPreset: 'custom',
				attackPreset: 'custom'
			},
			attackerStats: {
				int: 0,
				dex: 0,
				str: 0,
				critChance: 0
			},
			attackStats: {
				int: [0, 0],
				dex: [0, 0],
				str: [0, 0],
				accuracy: 0
			},
			defenderStats: {
				intDef: 0,
				dexDef: 0,
				strDef: 0
			}
		}
	})

	return (
		<Window
			{...DEFAULT_WINDOW_PROPS}
			id='damageSimulation'
			opened={opened}
			onClose={onClose}
			defaultWidth={480}
			defaultHeight={640}
			resizable='none'
			title='Damage Simulation'
		>
			<FormProvider form={form}>
				<Tabs defaultValue='presets'>
					<Tabs.List mb='md'>
						<Tabs.Tab value='presets'>Presets</Tabs.Tab>
						<Tabs.Tab value='attackerStats'>Attacker Stats</Tabs.Tab>
						<Tabs.Tab value='attackStats'>Attack Stats</Tabs.Tab>
						<Tabs.Tab value='defenderStats'>Defender Stats</Tabs.Tab>
					</Tabs.List>

					<Tabs.Panel value='presets'>
						<Presets />
					</Tabs.Panel>
					<Tabs.Panel value='attackerStats'>
						<AttackerStats />
					</Tabs.Panel>
					<Tabs.Panel value='attackStats'>
						<AttackStats />
					</Tabs.Panel>
					<Tabs.Panel value='defenderStats'>
						<DefenderStats />
					</Tabs.Panel>
				</Tabs>

				<Results />
			</FormProvider>
		</Window>
	)
}

function Presets() {
	const form = useFormContext()

	const ownedHeroes = useOwnedHeroes()
	const { data: heroesData } = useTabletopHeroes()
	const runes = useMemo(() => ownedHeroes.flatMap(hero => {
		const heroData = heroesData[hero.tabletopCharacterId]
		if (!heroData) return []
		const runeMap = (rune: TabletopHeroData['runes']['PRIMARY' | 'SECONDARY' | 'PASSIVE'][number]) => ({
			value: `${hero.tabletopCharacterId}__${rune.slot}__${rune.name}`,
			label: rune.name
		})
		return {
			group: hero.heroName,
			items: [
				heroData.runes.PRIMARY.map(runeMap),
				heroData.runes.SECONDARY.map(runeMap),
				heroData.runes.PASSIVE.map(runeMap)
			].flat()
		}
	}), [heroesData, ownedHeroes])

	form.watch('presets.enemyPreset', ({ value }) => {
		const preset = getEnemyPreset(value)
		form.setValues({
			defenderStats: {
				intDef: preset.int,
				dexDef: preset.dex,
				strDef: preset.str
			}
		})
	})

	form.watch('presets.attackPreset', ({ value: tValue }) => {
		const value = tValue as 'custom' | `${number}__${Enums<'rune_slot'>}__${string}`
		if (value === 'custom') return

		const [tabletopCharacterId, runeSlot, runeName] = typedSplit(value, '__')
		const heroData = heroesData[tabletopCharacterId]
		if (!heroData) return

		form.setValues({
			attackerStats: {
				int: heroData.stats.int,
				dex: heroData.stats.dex,
				str: heroData.stats.str,
				critChance: heroData.stats.critChance
			}
		})

		const runeData = heroData.runes[runeSlot].find(rune => rune.name === runeName)
		if (!runeData) return

		const runeDamage = runeData.data.effect[0]?.damage
		if (!runeDamage) return

		form.setValues({
			attackStats: {
				int: [runeDamage.mainStats.int?.flat ?? 0, runeDamage.mainStats.int?.scale ?? 0],
				dex: [runeDamage.mainStats.dex?.flat ?? 0, runeDamage.mainStats.dex?.scale ?? 0],
				str: [runeDamage.mainStats.str?.flat ?? 0, runeDamage.mainStats.str?.scale ?? 0],
				accuracy: runeDamage.accuracy
			}
		})
	})

	return (
		<Stack h={SECTION_HEIGHT}>
			<Select
				label='Enemy Preset'
				placeholder='Pick preset'
				data={[
					{ value: 'custom', label: 'Custom' },
					{ value: 'squishy', label: 'Squishy' },
					{ value: 'average', label: 'Average' },
					{ value: 'tanky', label: 'Tanky' }
				]}
				allowDeselect={false}
				key={form.key('presets.enemyPreset')}
				{...form.getInputProps('presets.enemyPreset')}
			/>
			<Select
				label='Attack Preset'
				placeholder='Pick preset'
				data={[
					{ group: 'Custom', items: [{ value: 'custom', label: 'Custom' }] },
					...runes
				]}
				allowDeselect={false}
				key={form.key('presets.attackPreset')}
				{...form.getInputProps('presets.attackPreset')}
			/>
		</Stack>
	)
}

function AttackerStats() {
	const form = useFormContext()

	const ownedHeroes = useOwnedHeroes().map(hero => ({ value: hero.tabletopCharacterId.toString(), label: hero.heroName }))

	const [selectedHero, setSelectedHero] = useState<string | null>(null)

	const { data: heroesData } = useTabletopHeroes()

	const copyHeroStats = () => {
		if (!selectedHero) return
		const heroData = heroesData[+selectedHero]
		if (!heroData) return
		form.setValues({
			attackerStats: {
				int: heroData.stats.int,
				dex: heroData.stats.dex,
				str: heroData.stats.str,
				critChance: heroData.stats.critChance
			}
		})
	}

	return (
		<Stack h={SECTION_HEIGHT}>
			<Group grow>
				<NumberInput
					{...NUMBER_INPUT_PROPS}
					label='INT'
					key={form.key('attackerStats.int')}
					{...form.getInputProps('attackerStats.int')}
				/>
				<NumberInput
					{...NUMBER_INPUT_PROPS}
					label='DEX'
					key={form.key('attackerStats.dex')}
					{...form.getInputProps('attackerStats.dex')}
				/>
				<NumberInput
					{...NUMBER_INPUT_PROPS}
					label='STR'
					key={form.key('attackerStats.str')}
					{...form.getInputProps('attackerStats.str')}
				/>
				<NumberInput
					{...NUMBER_INPUT_PROPS}
					label='Crit Chance'
					key={form.key('attackerStats.critChance')}
					{...form.getInputProps('attackerStats.critChance')}
				/>
			</Group>
			<Group grow>
				<Select
					data={ownedHeroes}
					value={selectedHero}
					onChange={setSelectedHero}
				/>
				<Button variant='default' flex={1} onClick={copyHeroStats} disabled={!selectedHero}>Copy Hero Stats</Button>
			</Group>
		</Stack>
	)
}

function AttackStats() {
	const form = useFormContext()

	const isCustom = form.values.presets.attackPreset === 'custom'

	return (
		<Stack h={SECTION_HEIGHT}>
			<Group grow align='start'>
				<Stack>
					<NumberInput
						{...NUMBER_INPUT_PROPS}
						label='INT Flat'
						disabled={!isCustom}
						key={form.key('attackStats.int.0')}
						{...form.getInputProps('attackStats.int.0')}
					/>
					<NumberInput
						{...NUMBER_INPUT_PROPS}
						label='INT Scale'
						disabled={!isCustom}
						key={form.key('attackStats.int.1')}
						{...form.getInputProps('attackStats.int.1')}
					/>
				</Stack>
				<Stack>
					<NumberInput
						{...NUMBER_INPUT_PROPS}
						label='DEX Flat'
						disabled={!isCustom}
						key={form.key('attackStats.dex.0')}
						{...form.getInputProps('attackStats.dex.0')}
					/>
					<NumberInput
						{...NUMBER_INPUT_PROPS}
						label='DEX Scale'
						disabled={!isCustom}
						key={form.key('attackStats.dex.1')}
						{...form.getInputProps('attackStats.dex.1')}
					/>
				</Stack>
				<Stack>
					<NumberInput
						{...NUMBER_INPUT_PROPS}
						label='STR Flat'
						disabled={!isCustom}
						key={form.key('attackStats.str.0')}
						{...form.getInputProps('attackStats.str.0')}
					/>
					<NumberInput
						{...NUMBER_INPUT_PROPS}
						label='STR Scale'
						disabled={!isCustom}
						key={form.key('attackStats.str.1')}
						{...form.getInputProps('attackStats.str.1')}
					/>
				</Stack>
				<NumberInput
					{...NUMBER_INPUT_PROPS}
					label='Accuracy'
					disabled={!isCustom}
					key={form.key('attackStats.accuracy')}
					{...form.getInputProps('attackStats.accuracy')}
				/>
			</Group>
		</Stack>
	)
}

function DefenderStats() {
	const form = useFormContext()

	const isCustom = form.values.presets.enemyPreset === 'custom'

	return (
		<Stack h={SECTION_HEIGHT}>
			<Group grow>
				<NumberInput
					{...NUMBER_INPUT_PROPS}
					label='INT Defence'
					disabled={!isCustom}
					key={form.key('defenderStats.intDef')}
					{...form.getInputProps('defenderStats.intDef')}
				/>
				<NumberInput
					{...NUMBER_INPUT_PROPS}
					label='DEX Defence'
					disabled={!isCustom}
					key={form.key('defenderStats.dexDef')}
					{...form.getInputProps('defenderStats.dexDef')}
				/>
				<NumberInput
					{...NUMBER_INPUT_PROPS}
					label='STR Defence'
					disabled={!isCustom}
					key={form.key('defenderStats.strDef')}
					{...form.getInputProps('defenderStats.strDef')}
				/>
			</Group>
		</Stack>
	)
}

const n = 100_000

function Results() {
	const form = useFormContext()

	const [parsedResults, setParsedResults] = useState<{ damage: number, count: number, percentage: number }[]>([])

	const handleReset = () => {
		setParsedResults([])
		form.reset()
	}

	const handleSubmit = () => {
		const results: Record<number, number> = {}

		for (let i = 0; i < n; i++) {
			const values = form.getValues()

			const result = damageCalculation({
				attack: {
					damageType: {
						int: values.attackStats.int,
						dex: values.attackStats.dex,
						str: values.attackStats.str
					},
					accuracy: values.attackStats.accuracy
				},
				attackerStats: {
					int: values.attackerStats.int,
					dex: values.attackerStats.dex,
					str: values.attackerStats.str,
					critChance: values.attackerStats.critChance
				},
				defenderStats: {
					intDef: values.defenderStats.intDef,
					dexDef: values.defenderStats.dexDef,
					strDef: values.defenderStats.strDef
				}
			})

			results[result] = (results[result] || 0) + 1
		}

		const parsedResults = Object.entries(results).map(([key, value]) => ({
			damage: +key,
			count: value,
			percentage: (value / n) * 100
		}))
		setParsedResults(parsedResults)
	}

	return (
		<Stack mt='md'>
			<LineChart
				h={300}
				data={parsedResults}
				dataKey='damage'
				series={[{ name: 'percentage', color: 'blue' }]}
				withTooltip={false}
				dotProps={{ r: 0 }}
				strokeWidth={3}
				xAxisLabel='Damage Dealt'
				yAxisLabel='Percentage Chance'
				gridAxis='xy'
			/>
			<Group>
				<Button variant='default' type='reset' onClick={handleReset}>Reset All</Button>
				<Button flex={1} type='submit' onClick={handleSubmit}>Simulate</Button>
			</Group>
		</Stack>
	)
}
