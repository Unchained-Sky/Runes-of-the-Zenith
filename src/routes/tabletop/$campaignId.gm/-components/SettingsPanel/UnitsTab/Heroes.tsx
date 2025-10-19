import { ActionIcon, Avatar, Button, Group, Menu, Modal, NumberInput, Stack, Table, Text, Title, type NumberInputProps } from '@mantine/core'
import { useForm } from '@mantine/form'
import { useDisclosure } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'
import { IconPencil, IconTrash, IconX } from '@tabler/icons-react'
import { useMutation } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { type } from 'arktype'
import { Fragment } from 'react'
import { getServiceClient } from '~/supabase/getServiceClient'
import { requireAccount } from '~/supabase/requireAccount'
import { useSupabase } from '~/supabase/useSupabase'
import { useTabletopHeroes } from '../../../-hooks/useTabletopData'

export default function Heroes() {
	const { data: heroes } = useTabletopHeroes()

	return (
		<Stack gap={0}>
			<Title order={3}>Heroes</Title>
			<Table>
				<Table.Thead>
					<Table.Tr>
						<Table.Th>Name</Table.Th>
						<Table.Th>Shield</Table.Th>
						<Table.Th>Health</Table.Th>
						<Table.Th>Position</Table.Th>
						<Table.Th>Edit</Table.Th>
					</Table.Tr>
				</Table.Thead>
				<Table.Tbody>
					{Object.values(heroes).map(hero => {
						if (hero.tabletopHero === null) return null
						return (
							<Hero
								key={hero.heroId}
								heroId={hero.heroId}
							/>
						)
					})}
				</Table.Tbody>
			</Table>
		</Stack>
	)
}

type HeroProps = {
	heroId: number
}

function Hero({ heroId }: HeroProps) {
	const { campaignId } = getRouteApi('/tabletop/$campaignId/gm/').useLoaderData()
	const { heroName, tabletopHero } = useTabletopHeroes().data[heroId] ?? {}

	const [editMode, editModeHandlers] = useDisclosure(false)

	const removeHero = useMutation({
		mutationFn: removeHeroAction,
		onError: error => {
			notifications.show({
				title: 'Failed to remove hero',
				color: 'red',
				message: error.message
			})
		}
	})

	// const getTabletopLifeValue = (value: keyof Tables<'tabletop_heroes'> & (`health_${string}` | `shield_${string}`)) => {
	// 	return tabletopHero?.[value] ?? 0
	// }

	// const getTabletopPosition = () => {
	// if (!tabletopHero) return null
	// if (
	// 	tabletopHero.position_q === null
	// 	|| tabletopHero.position_r === null
	// 	|| tabletopHero.position_s === null
	// ) return null
	// const position = {
	// 	q: tabletopHero.position_q,
	// 	r: tabletopHero.position_r,
	// 	s: tabletopHero.position_s
	// }
	// return `${position.q},${position.r},${position.s}`
	// }

	if (!tabletopHero) return null

	return (
		<Fragment>
			<HeroEditModal
				heroId={heroId}
				opened={editMode}
				close={editModeHandlers.close}
			/>

			<Table.Tr>
				<Table.Td>
					<Group gap='xs'>
						<Avatar />
						<Text size='lg'>{heroName}</Text>
					</Group>
				</Table.Td>
				<Table.Td>
					<Stack gap={0}>
						{/* <Text size='sm'>{getTabletopLifeValue('shield_durability')}</Text>
						<Text size='sm'>{getTabletopLifeValue('shield_current')} / {getTabletopLifeValue('shield_max')}</Text> */}
					</Stack>
				</Table.Td>
				{/* <Table.Td>{getTabletopLifeValue('health_current')} / {getTabletopLifeValue('health_max')}</Table.Td> */}
				{/* <Table.Td>{getTabletopPosition() ?? 'Unplaced'}</Table.Td> */}
				<Table.Td>
					<Group>
						<ActionIcon variant='subtle' color='gray' onClick={editModeHandlers.toggle}>
							<IconPencil />
						</ActionIcon>
						<Menu>
							<Menu.Target>
								<ActionIcon variant='subtle' color='red'>
									<IconX />
								</ActionIcon>
							</Menu.Target>
							<Menu.Dropdown>
								<Menu.Label>Are you sure?</Menu.Label>
								<Menu.Item
									color='red'
									leftSection={<IconTrash size={14} />}
									onClick={() => removeHero.mutate({
										data: {
											campaignId,
											characterId: tabletopHero.characterId
										}
									})}
								>
									Remove Hero
								</Menu.Item>
							</Menu.Dropdown>
						</Menu>
					</Group>
				</Table.Td>
			</Table.Tr>
		</Fragment>
	)
}

const removeHeroSchema = type({
	characterId: 'number',
	campaignId: 'number'
})

const removeHeroAction = createServerFn({ method: 'POST' })
	.validator(removeHeroSchema)
	.handler(async ({ data: { campaignId, characterId } }) => {
		const { supabase, user } = await requireAccount()

		// Check if the user is the GM
		const gmCheck = await supabase
			.from('campaign_info')
			.select('gmUserId: user_id')
			.eq('campaign_id', campaignId)
			.limit(1)
			.single()
		if (gmCheck.error) throw new Error(gmCheck.error.message, { cause: gmCheck.error })
		if (gmCheck.data.gmUserId !== user.id) throw new Error('You are not the GM of this campaign')

		const serviceClient = getServiceClient()

		const { error } = await serviceClient
			.from('tabletop_characters')
			.delete()
			.eq('character_id', characterId)
		if (error) throw new Error(error.message, { cause: error })
	})

type HeroEditModalProps = {
	heroId: number
	opened: boolean
	close: () => void
}

const numberInputProps: NumberInputProps = {
	allowDecimal: false,
	allowNegative: false,
	stepHoldDelay: 500,
	stepHoldInterval: t => Math.max(1000 / t ** 2, 25)
}

function HeroEditModal({ heroId, opened, close }: HeroEditModalProps) {
	const { heroName, tabletopHero } = useTabletopHeroes().data[heroId] ?? {}

	const supabase = useSupabase()

	const form = useForm({
		mode: 'uncontrolled',
		initialValues: {
			// shieldDurability: tabletopHero?.shield_durability ?? 0,
			// shieldCurrent: tabletopHero?.shield_current ?? 0,
			// shieldMax: tabletopHero?.shield_max ?? 0,
			// healthCurrent: tabletopHero?.health_current ?? 0,
			// healthMax: tabletopHero?.health_max ?? 0
		},
		validate: {
			// healthMax: value => value > 0 ? null : 'Max health must be greater than 0'
		}
	})

	// const handleSubmit = (values: typeof form.values) => {
	// 	(async () => {
	// 		const { error } = await supabase
	// 			.from('tabletop_heroes')
	// 			.upsert({
	// 				hero_id: heroId,
	// 				shield_durability: values.shieldDurability,
	// 				shield_current: values.shieldCurrent,
	// 				shield_max: values.shieldMax,
	// 				health_current: values.healthCurrent,
	// 				health_max: values.healthMax
	// 			})
	// 		if (error) throw new Error(error.message, { cause: error })
	// 	})().catch(console.error)
	// 	close()
	// }

	return (
		<Modal
			opened={opened}
			onClose={close}
			onExitTransitionEnd={() => form.reset()}
			title={`Edit ${heroName}`}
		>
			{/* <form onSubmit={form.onSubmit(handleSubmit)}> */}
			<Stack>
				<Group grow>
					<NumberInput
						label='Shield Durability'
						key={form.key('shieldDurability')}
						{...form.getInputProps('shieldDurability')}
						{...numberInputProps}
					/>
					<NumberInput
						label='Current Shield'
						key={form.key('shieldCurrent')}
						{...form.getInputProps('shieldCurrent')}
						{...numberInputProps}
					/>
					<NumberInput
						label='Max Shield'
						key={form.key('shieldMax')}
						{...form.getInputProps('shieldMax')}
						{...numberInputProps}
					/>
				</Group>
				<Group grow align='flex-start'>
					<NumberInput
						label='Current Health'
						key={form.key('healthCurrent')}
						{...form.getInputProps('healthCurrent')}
						{...numberInputProps}
					/>
					<NumberInput
						label='Max Health'
						key={form.key('healthMax')}
						{...form.getInputProps('healthMax')}
						{...numberInputProps}
					/>
				</Group>
				<Group>
					<Button variant='default' onClick={close}>Cancel</Button>
					<Button flex={1} type='submit'>Update</Button>
				</Group>
			</Stack>
			{/* </form> */}
		</Modal>
	)
}
