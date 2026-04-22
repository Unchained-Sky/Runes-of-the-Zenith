import { ActionIcon, Button, Card, Divider, Group, NumberInput, Select, Stack, Table, Text, TextInput, Title } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { IconCheck, IconPencil, IconX } from '@tabler/icons-react'
import { useMemo, useState } from 'react'
import { type TabletopHeroData } from '~/routes/tabletop/-hooks/tabletopData/useTabletopHeroes'
import { useAddLingering } from '~/routes/tabletop/-utils/gameActions/addLingering'
import { useUpdateLingering } from '~/routes/tabletop/-utils/gameActions/updateLingering'
import { lingeringDecrementTime } from '~/routes/tabletop/-utils/lingeringData'
import { type Enums } from '~/supabase/databaseTypes'
import { typedObject } from '~/types/typedObject'
import { int2 } from '~/utils/int'
import { useHeroWindowContext } from './HeroWindowContext'

export default function HeroLingering() {
	const [isEditing, { toggle, close }] = useDisclosure(false)

	return (
		<Card component={Stack} bg='dark.5'>
			<Group>
				<Title order={4}>Lingering Effects</Title>
				<ActionIcon variant='subtle'>
					<IconPencil onClick={toggle} />
				</ActionIcon>
			</Group>
			{isEditing ? <EditLingering close={close} /> : <LingeringDisplay />}
		</Card>
	)
}

function LingeringDisplay() {
	const { lingering } = useHeroWindowContext()

	return lingering.length
		? (
			<Table>
				<Table.Thead>
					<Table.Tr>
						<Table.Th style={{ width: '100%' }}>Effect</Table.Th>
						<Table.Th style={{ whiteSpace: 'nowrap' }}>Time Remaining</Table.Th>
					</Table.Tr>
				</Table.Thead>
				<Table.Tbody>
					{lingering.map(lingering => {
						return (
							<Table.Tr key={lingering.lingeringId}>
								<Table.Td>{lingering.data.description}</Table.Td>
								<Table.Td style={{ whiteSpace: 'nowrap' }}>{lingering.remainingTime} - {lingeringDecrementTime[lingering.decrementTime]}</Table.Td>
							</Table.Tr>
						)
					})}
				</Table.Tbody>
			</Table>
		)
		: <Text fs='italic'>None</Text>
}

type EditLingeringProps = {
	close: () => void
}

function EditLingering({ close }: EditLingeringProps) {
	return (
		<Stack>
			<UpdateLingering />
			<AddLingering close={close} />
		</Stack>
	)
}

function UpdateLingering() {
	const { lingering } = useHeroWindowContext()

	return (
		<Stack>
			<Divider label='Update Lingering Effect' />
			<Table>
				<Table.Thead>
					<Table.Tr>
						<Table.Th style={{ width: '100%' }}>Effect</Table.Th>
						<Table.Th>Time Remaining</Table.Th>
					</Table.Tr>
				</Table.Thead>
				<Table.Tbody>
					{lingering.map(lingering => {
						return (
							<UpdateLingeringEffect key={lingering.lingeringId} lingering={lingering} />
						)
					})}
				</Table.Tbody>
			</Table>
		</Stack>
	)
}

type UpdateLingeringEffectProps = {
	lingering: TabletopHeroData['lingering'][number]
}

function UpdateLingeringEffect({ lingering }: UpdateLingeringEffectProps) {
	const { tabletopCharacterId } = useHeroWindowContext()

	const [value, setValue] = useState(lingering.remainingTime)

	const updateLingering = useUpdateLingering()

	return (
		<Table.Tr key={lingering.lingeringId}>
			<Table.Td>{lingering.data.description}</Table.Td>
			<Table.Td>
				<Group wrap='nowrap' gap='xs'>
					<ActionIcon
						disabled={value === lingering.remainingTime}
						onClick={() => {
							updateLingering.mutate({
								data: {
									tabletopCharacterId,
									characterType: 'HERO',
									lingeringEffects: [
										{
											lingeringId: lingering.lingeringId,
											remainingTime: value
										}
									]
								}
							})
						}}
					>
						<IconCheck />
					</ActionIcon>
					<NumberInput
						miw={80}
						maw={80}
						value={value}
						onChange={event => setValue(+event)}
						min={0}
						max={int2.ceil}
					/>
					<ActionIcon
						variant='light'
						color='red'
						onClick={() => {
							setValue(0)
						}}
					>
						<IconX />
					</ActionIcon>
					<Text span style={{ whiteSpace: 'nowrap' }}>
						{lingeringDecrementTime[lingering.decrementTime]}
					</Text>
				</Group>
			</Table.Td>
		</Table.Tr>
	)
}

type AddLingeringProps = {
	close: () => void
}

function AddLingering({ close }: AddLingeringProps) {
	const { tabletopCharacterId } = useHeroWindowContext()

	const addLingering = useAddLingering()

	const [lingeringText, setLingeringText] = useState('')
	const [decrementTime, setDecrementTime] = useState<Enums<'decrement_time'> | null>(null)
	const [duration, setDuration] = useState(1)

	const selectData = useMemo(() => typedObject.entries(lingeringDecrementTime).map(([key, value]) => ({ value: key, label: value })), [])

	const allValid = lingeringText.length > 0 && decrementTime !== null

	return (
		<Stack>
			<Divider label='Add Lingering Effect' />
			<TextInput
				label='Lingering Effect'
				placeholder='Gain 30 power'
				value={lingeringText}
				onChange={event => setLingeringText(event.currentTarget.value)}
			/>
			<Group grow>
				<Select
					label='Decrement Time'
					placeholder='Custom'
					data={selectData}
					value={decrementTime}
					onChange={setDecrementTime}
				/>
				<NumberInput
					label='Duration'
					min={1}
					max={int2.ceil}
					defaultValue={1}
					value={duration}
					onChange={event => setDuration(+event)}
				/>
			</Group>
			<Group>
				<Button variant='default' onClick={close}>Cancel</Button>
				<Button
					flex={1}
					type='submit'
					disabled={!allValid}
					loading={addLingering.isPending}
					onClick={() => {
						if (!allValid) return
						addLingering.mutate({
							data: {
								tabletopCharacterId,
								characterType: 'HERO',
								lingeringEffects: [
									{
										decrementTime,
										remainingTime: duration,
										data: {
											description: lingeringText
										}
									}
								]
							}
						})
						close()
					}}
				>
					Add
				</Button>
			</Group>
		</Stack>
	)
}
