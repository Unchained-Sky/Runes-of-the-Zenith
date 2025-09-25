import { ActionIcon, Group, rem, Stack, TextInput, Title } from '@mantine/core'
import { IconCirclePlusFilled } from '@tabler/icons-react'
import { useMutation } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { type } from 'arktype'
import { useState } from 'react'
import { requireAccount } from '~/supabase/requireAccount'

export const Route = createFileRoute('/hero/create')({
	component: RouteComponent,
	loader: async () => await serverLoader(),
	head: () => ({
		meta: [{ title: 'Create Hero' }]
	})
})

const serverLoader = createServerFn({ method: 'GET' })
	.handler(async () => {
		await requireAccount({ backlink: '/hero/create' })
	})

function RouteComponent() {
	const [heroName, setHeroName] = useState('')

	const { queryClient } = Route.useRouteContext()
	const navigate = useNavigate({ from: '/hero/create' })

	const createHero = useMutation({
		mutationFn: createHeroAction,
		onSuccess: async data => {
			void queryClient.invalidateQueries({ queryKey: ['navbar', 'heroCount'] })
			await navigate({ to: '/hero/$heroId', params: { heroId: data } })
		}
	})

	return (
		<Stack>
			<Title>Create Hero</Title>

			<Group>
				<TextInput
					value={heroName}
					onChange={event => setHeroName(event.currentTarget.value)}
					label='Hero Name'
					w={rem(240)}
					rightSection={(
						<ActionIcon
							loading={!!createHero.submittedAt}
							onClick={() => {
								createHero.mutate({ data: { heroName } })
							}}
						>
							<IconCirclePlusFilled />
						</ActionIcon>
					)}
				/>
			</Group>
		</Stack>
	)
}

const createHeroSchema = type({
	heroName: 'string'
})

const createHeroAction = createServerFn({ method: 'POST' })
	.validator(createHeroSchema)
	.handler(async ({ data: { heroName } }) => {
		const { supabase } = await requireAccount()

		const { data, error } = await supabase
			.from('hero_info')
			.insert({ hero_name: heroName })
			.select('heroId: hero_id')
			.limit(1)
			.single()
		if (error) throw new Error(error.message, { cause: error })

		return data.heroId.toString()
	})
