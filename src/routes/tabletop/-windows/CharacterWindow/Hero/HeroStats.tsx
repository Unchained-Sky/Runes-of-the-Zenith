import { ActionIcon, Button, Card, Group, NumberInput, type NumberInputProps, Stack, Text, Title } from '@mantine/core'
import { isInRange, useForm } from '@mantine/form'
import { useDisclosure } from '@mantine/hooks'
import { IconPencil } from '@tabler/icons-react'
import { useUpdateCharacterStats } from '~/routes/tabletop/-utils/gameActions/updateCharacterStats'
import { useHeroWindowContext } from './HeroWindowContext'

export default function HeroStats() {
	const [isEditing, { toggle, close }] = useDisclosure(false)

	return (
		<Card component={Stack} bg='dark.5'>
			<Group>
				<Title order={4}>Stats</Title>
				<ActionIcon variant='subtle'>
					<IconPencil onClick={toggle} />
				</ActionIcon>
			</Group>
			{isEditing ? <EditStats close={close} /> : <StatsDisplay />}
		</Card>
	)
}

function StatsDisplay() {
	const heroData = useHeroWindowContext()
	const { stats, tabletopStats, pos } = heroData

	return (
		<Stack gap={2}>
			<Text>
				<Text span>Position: </Text>
				<Text span fs={pos ? 'normal' : 'italic'}>{pos ? pos.join(',') : 'Unplaced'}</Text>
			</Text>
			<Text>Shield: {tabletopStats.shield} [{tabletopStats.trauma}] / {stats.maxShield}</Text>
			<Text>Health: {tabletopStats.health} [{tabletopStats.wounds}] / {stats.maxHealth}</Text>
			<Text>
				<Text span>Power: </Text>
				<Text span c='blue'>{stats.int}</Text>
				<Text span> / </Text>
				<Text span c='red'>{stats.str}</Text>
				<Text span> / </Text>
				<Text span c='green'>{stats.dex}</Text>
			</Text>
			<Text>Movement: {tabletopStats.movement} / {stats.maxMovement}</Text>
		</Stack>
	)
}

const numberInputProps: NumberInputProps = {
	min: 0,
	allowDecimal: false,
	allowNegative: false,
	stepHoldDelay: 500,
	stepHoldInterval: t => Math.max(1000 / t ** 2, 25)
}

type EditStatsProps = {
	close: () => void
}

function EditStats({ close }: EditStatsProps) {
	const heroData = useHeroWindowContext()

	const form = useForm({
		mode: 'uncontrolled',
		initialValues: {
			currentShield: heroData.tabletopStats.shield,
			trauma: heroData.tabletopStats.trauma,
			currentHealth: heroData.tabletopStats.health,
			wounds: heroData.tabletopStats.wounds,
			currentMovement: heroData.tabletopStats.movement
		},
		validate: {
			currentShield: isInRange({ min: 0, max: heroData.stats.maxShield }, 'Shield must be between 0 and max shield'),
			trauma: isInRange({ min: 0, max: heroData.stats.maxShield }, 'Trauma must be between 0 and max shield'),
			currentHealth: isInRange({ min: 0, max: heroData.stats.maxHealth }, 'Health must be between 0 and max health'),
			wounds: isInRange({ min: 0, max: heroData.stats.maxHealth }, 'Wounds must be between 0 and max health'),
			currentMovement: isInRange({ min: 0, max: heroData.stats.maxMovement }, 'Movement must be between 0 and max movement')
		}
	})

	const updateCharacter = useUpdateCharacterStats()

	const handleSubmit = (values: typeof form.values) => {
		updateCharacter.mutate({
			data: {
				tabletopCharacterId: heroData.tabletopCharacterId,
				values,
				characterType: 'HERO'
			}
		})
		close()
		form.setInitialValues(values)
	}

	return (
		<Stack>
			<form onSubmit={form.onSubmit(handleSubmit)}>
				<Stack>

					<Group grow align='flex-start'>
						<NumberInput
							label='Shield Durability'
							key={form.key('currentShield')}
							max={heroData.stats.maxShield}
							{...form.getInputProps('currentShield')}
							{...numberInputProps}
						/>
						<NumberInput
							label='Trauma'
							key={form.key('trauma')}
							max={heroData.stats.maxShield}
							{...form.getInputProps('trauma')}
							{...numberInputProps}
						/>
						<NumberInput label='Max Shield' value={heroData.stats.maxShield} disabled />
					</Group>
					<Group grow align='flex-start'>
						<NumberInput
							label='Current Health'
							key={form.key('currentHealth')}
							max={heroData.stats.maxHealth}
							{...form.getInputProps('currentHealth')}
							{...numberInputProps}
						/>
						<NumberInput
							label='Wounds'
							key={form.key('wounds')}
							max={heroData.stats.maxHealth}
							{...form.getInputProps('wounds')}
							{...numberInputProps}
						/>
						<NumberInput label='Max Health' value={heroData.stats.maxHealth} disabled />
					</Group>
					<Group>
						<Button variant='default' onClick={close}>Cancel</Button>
						<Button flex={1} type='submit'>Update</Button>
					</Group>
				</Stack>
			</form>
		</Stack>
	)
}
