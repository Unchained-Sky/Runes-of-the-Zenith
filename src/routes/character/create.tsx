import { ActionIcon, Group, rem, Stack, TextInput, Title } from '@mantine/core'
import { IconCirclePlusFilled } from '@tabler/icons-react'
import { useMutation } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { type } from 'arktype'
import { useState } from 'react'
import { requireAccount } from '~/supabase/requireAccount'

export const Route = createFileRoute('/character/create')({
	component: RouteComponent,
	loader: async () => await serverLoader(),
	head: () => ({
		meta: [{ title: 'Create Character' }]
	})
})

const serverLoader = createServerFn({ method: 'GET' })
	.handler(async () => {
		await requireAccount({ backlink: '/character/create' })
	})

function RouteComponent() {
	const [characterName, setCharacterName] = useState('')

	const { queryClient } = Route.useRouteContext()
	const navigate = useNavigate({ from: '/character/create' })

	const createCharacter = useMutation({
		mutationFn: createCharacterAction,
		onSuccess: async data => {
			void queryClient.invalidateQueries({ queryKey: ['navbar', 'characterCount'] })
			await navigate({ to: '/character/$id', params: { id: data } })
		}
	})

	return (
		<Stack>
			<Title>Create Character</Title>

			<Group>
				<TextInput
					value={characterName}
					onChange={event => setCharacterName(event.currentTarget.value)}
					label='Character Name'
					w={rem(240)}
					name='character_name'
					rightSection={(
						<ActionIcon
							loading={!!createCharacter.submittedAt}
							onClick={() => {
								createCharacter.mutate({ data: { characterName } })
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

const createCharacterSchema = type({
	characterName: 'string'
})

const createCharacterAction = createServerFn({ method: 'POST' })
	.validator(createCharacterSchema)
	.handler(async ({ data: { characterName } }) => {
		const { supabase } = await requireAccount()

		const { data, error } = await supabase
			.from('character_info')
			.insert({ character_name: characterName })
			.select()
			.limit(1)
			.single()
		if (error) throw new Error(error.message, { cause: error })

		return data.character_id.toString()
	})
