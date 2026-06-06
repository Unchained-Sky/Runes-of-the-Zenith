import { ActionIcon, Button, Card, Divider, Group, Slider, Stack, Switch, Text, Title } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { IconPencil } from '@tabler/icons-react'
import { useState } from 'react'
import { useUpdateAggression } from '~/routes/tabletop/-utils/gameActions/updateAggression'
import { useUpdateEnemyPrimary } from '~/routes/tabletop/-utils/gameActions/updateEnemyPrimary'
import { useEnemyWindowContext } from './EnemyWindowContext'

export default function EnemyAggression() {
	const [isEditing, { toggle }] = useDisclosure(false)

	return (
		<Card component={Stack} bg='dark.5'>
			<Group>
				<Title order={4}>Turn</Title>
				<ActionIcon variant='subtle'>
					<IconPencil onClick={toggle} />
				</ActionIcon>
			</Group>
			{isEditing ? <EditTurn /> : <TurnDisplay />}
		</Card>
	)
}

function TurnDisplay() {
	const enemyData = useEnemyWindowContext()

	return (
		<Stack>
			<Text>Aggression: {enemyData.tabletopStats.currentAggression} / {enemyData.stats.aggression}</Text>
			<Text>
				Primary:
				{' '}
				<Text span c={enemyData.tabletopStats.usedPrimary ? 'red' : 'green'}>{enemyData.tabletopStats.usedPrimary ? 'Used' : 'Available'}</Text>
			</Text>
		</Stack>
	)
}

function EditTurn() {
	return (
		<Stack>
			<EditAggression />
			<EditPrimary />
		</Stack>
	)
}

function EditAggression() {
	const enemyData = useEnemyWindowContext()

	const [value, setValue] = useState(enemyData.tabletopStats.currentAggression)

	const updateAggression = useUpdateAggression()

	const marks = []
	if (enemyData.tabletopStats.currentAggression !== 0) marks.push({ value: 0, label: '0' })
	marks.push({ value: enemyData.tabletopStats.currentAggression, label: 'Current' })
	if (enemyData.tabletopStats.currentAggression !== enemyData.stats.aggression) marks.push({ value: enemyData.stats.aggression, label: `${enemyData.stats.aggression}` })

	return (
		<>
			<Divider label='Update Aggression' />
			<Group pb='sm' pt='md' gap='xl'>
				<Slider
					flex={1}
					min={0}
					max={enemyData.stats.aggression}
					marks={marks}
					value={value}
					onChange={setValue}
					pb='sm'
				/>
				<Button
					size='compact-md'
					disabled={value === enemyData.tabletopStats.currentAggression}
					onClick={() => {
						updateAggression.mutate({ data: {
							target: { tabletopCharacterIds: [enemyData.tabletopCharacterId] },
							amount: { absolute: value }
						} })
						close()
					}}
				>
					Update
				</Button>
			</Group>
		</>
	)
}

function EditPrimary() {
	const enemyData = useEnemyWindowContext()

	const [value, setValue] = useState(enemyData.tabletopStats.usedPrimary)

	const updateEnemyPrimary = useUpdateEnemyPrimary()

	return (
		<>
			<Divider label='Update Primary' />
			<Group justify='space-between'>
				<Switch
					labelPosition='left'
					label='Used Primary'
					checked={value}
					onChange={event => setValue(event.currentTarget.checked)}
					styles={{
						track: {
							backgroundColor: value ? undefined : 'var(--mantine-color-dark-6)'
						}
					}}
				/>

				<Button
					size='compact-md'
					disabled={value === enemyData.tabletopStats.usedPrimary}
					onClick={() => {
						updateEnemyPrimary.mutate({ data: {
							tabletopCharacterId: enemyData.tabletopCharacterId,
							usedPrimary: value
						} })
					}}
				>
					Update
				</Button>
			</Group>
		</>
	)
}
