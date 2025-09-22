import { ActionIcon, rem, Stack, TextInput, Title } from '@mantine/core'
import { useForm } from '@mantine/form'
import { IconCirclePlusFilled } from '@tabler/icons-react'
import { useMutation } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { type } from 'arktype'
import { requireAccount } from '~/supabase/requireAccount'

export const Route = createFileRoute('/campaign/create')({
	component: RouteComponent,
	loader: async () => await serverLoader(),
	head: () => ({
		meta: [{ title: 'Create Campaign' }]
	})
})

const serverLoader = createServerFn({ method: 'GET' }).handler(async () => {
	await requireAccount({ backlink: '/campaign/create' })
})

function RouteComponent() {
	const form = useForm({
		mode: 'uncontrolled',
		initialValues: {
			campaignName: ''
		},
		validate: {
			campaignName: value => (value.length <= 3 || value.length >= 32
				? 'Invalid Campaign Length'
				: null)
		}
	})

	const { queryClient } = Route.useRouteContext()
	const navigate = useNavigate({ from: '/campaign/create' })

	const campaignCreate = useMutation({
		mutationFn: campaignCreateAction,
		onSuccess: async data => {
			void queryClient.invalidateQueries({ queryKey: ['navbar', 'campaignCount'] })
			await navigate({ to: '/campaign/$id', params: { id: data } })
		}
	})

	return (
		<Stack>
			<Title>Create Campaign</Title>

			<form onSubmit={form.onSubmit(data => campaignCreate.mutate({ data }))}>
				<Stack maw={rem(240)}>
					<TextInput
						label='Campaign Name'
						name='campaign_name'
						key={form.key('campaignName')}
						{...form.getInputProps('campaignName')}
						rightSection={(
							<ActionIcon type='submit' loading={!!campaignCreate.submittedAt}>
								<IconCirclePlusFilled />
							</ActionIcon>
						)}
					/>
				</Stack>
			</form>
		</Stack>
	)
}

const createCharacterSchema = type({
	campaignName: '3 <= string <= 32'
})

const campaignCreateAction = createServerFn({ method: 'POST' })
	.validator(createCharacterSchema)
	.handler(async ({ data: { campaignName } }) => {
		const { supabase } = await requireAccount()

		const { data, error } = await supabase
			.from('campaign_info')
			.insert({ campaign_name: campaignName })
			.select()
			.limit(1)
			.single()
		if (error) throw new Error(error.message, { cause: error })

		return data.campaign_id.toString()
	})
