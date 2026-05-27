import { ActionIcon, Button, Card, Group, NumberInput, type NumberInputProps, Stack, Text, Title } from '@mantine/core'
import { isInRange, useForm } from '@mantine/form'
import { useDisclosure } from '@mantine/hooks'
import { IconPencil } from '@tabler/icons-react'
import { useUpdateCharacterStats } from '~/routes/tabletop/-utils/gameActions/updateCharacterStats'
import useCharacterWindowContext from './useCharacterWindowContext'

export default function CharacterStats() {
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
	const characterData = useCharacterWindowContext()
	const { stats, tabletopStats, pos } = characterData

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
	const characterData = useCharacterWindowContext()

	const form = useForm({
		mode: 'uncontrolled',
		initialValues: {
			currentShield: characterData.tabletopStats.shield,
			trauma: characterData.tabletopStats.trauma,
			currentHealth: characterData.tabletopStats.health,
			wounds: characterData.tabletopStats.wounds,
			currentMovement: characterData.tabletopStats.movement
		},
		validate: {
			currentShield: isInRange({ min: 0, max: characterData.stats.maxShield }, 'Shield must be between 0 and max shield'),
			trauma: isInRange({ min: 0, max: characterData.stats.maxShield }, 'Trauma must be between 0 and max shield'),
			currentHealth: isInRange({ min: 0, max: characterData.stats.maxHealth }, 'Health must be between 0 and max health'),
			wounds: isInRange({ min: 0, max: characterData.stats.maxHealth }, 'Wounds must be between 0 and max health'),
			currentMovement: isInRange({ min: 0, max: characterData.stats.maxMovement }, 'Movement must be between 0 and max movement')
		}
	})

	const updateCharacter = useUpdateCharacterStats()

	const handleSubmit = (values: typeof form.values) => {
		updateCharacter.mutate({
			data: {
				tabletopCharacterId: characterData.tabletopCharacterId,
				values,
				characterType: characterData.characterType
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
							max={characterData.stats.maxShield}
							{...form.getInputProps('currentShield')}
							{...numberInputProps}
						/>
						<NumberInput
							label='Trauma'
							key={form.key('trauma')}
							max={characterData.stats.maxShield}
							{...form.getInputProps('trauma')}
							{...numberInputProps}
						/>
						<NumberInput label='Max Shield' value={characterData.stats.maxShield} disabled />
					</Group>
					<Group grow align='flex-start'>
						<NumberInput
							label='Current Health'
							key={form.key('currentHealth')}
							max={characterData.stats.maxHealth}
							{...form.getInputProps('currentHealth')}
							{...numberInputProps}
						/>
						<NumberInput
							label='Wounds'
							key={form.key('wounds')}
							max={characterData.stats.maxHealth}
							{...form.getInputProps('wounds')}
							{...numberInputProps}
						/>
						<NumberInput label='Max Health' value={characterData.stats.maxHealth} disabled />
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
