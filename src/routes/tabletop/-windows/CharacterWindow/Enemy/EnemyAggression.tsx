import { ActionIcon, Button, Card, Group, Slider, Stack, Text, Title } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { IconPencil } from '@tabler/icons-react'
import { useState } from 'react'
import { useUpdateAggression } from '~/routes/tabletop/-utils/gameActions/updateAggression'
import { useEnemyWindowContext } from './EnemyWindowContext'

export default function EnemyAggression() {
	const [isEditing, { toggle, close }] = useDisclosure(false)

	return (
		<Card component={Stack} bg='dark.5'>
			<Group>
				<Title order={4}>Aggression</Title>
				<ActionIcon variant='subtle'>
					<IconPencil onClick={toggle} />
				</ActionIcon>
			</Group>
			{isEditing ? <EditAggression close={close} /> : <AggressionDisplay />}
		</Card>
	)
}

function AggressionDisplay() {
	const enemyData = useEnemyWindowContext()

	return (
		<Group>
			<Text>{enemyData.tabletopStats.currentAggression} / {enemyData.stats.aggression}</Text>
		</Group>
	)
}

type EditAggressionProps = {
	close: () => void
}

function EditAggression({ close }: EditAggressionProps) {
	const enemyData = useEnemyWindowContext()

	const [value, setValue] = useState(enemyData.tabletopStats.currentAggression)

	const updateAggression = useUpdateAggression()

	const marks = []
	if (enemyData.tabletopStats.currentAggression !== 0) marks.push({ value: 0, label: '0' })
	marks.push({ value: enemyData.tabletopStats.currentAggression, label: 'Current' })
	if (enemyData.tabletopStats.currentAggression !== enemyData.stats.aggression) marks.push({ value: enemyData.stats.aggression, label: `${enemyData.stats.aggression}` })

	return (
		<Group pb='sm' pt='md'>
			<Slider
				flex={1}
				min={0}
				max={enemyData.stats.aggression}
				marks={marks}
				value={value}
				onChange={setValue}
				pb='sm'
			/>
			<Button size='compact-md' onClick={() => {
				if (value !== enemyData.tabletopStats.currentAggression) {
					updateAggression.mutate({ data: {
						target: { tabletopCharacterIds: [enemyData.tabletopCharacterId] },
						amount: { absolute: value }
					} })
				}
				close()
			}}>Update</Button>
		</Group>
	)
}
