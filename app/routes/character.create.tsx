import { ActionIcon, Group, rem, Stack, TextInput, Title } from '@mantine/core'
import { type ActionFunctionArgs, json, type LoaderFunctionArgs, type MetaFunction } from '@remix-run/node'
import { Form, redirect, useActionData } from '@remix-run/react'
import { IconCirclePlusFilled } from '@tabler/icons-react'
import { requireAccount } from '~/supabase/requireAccount'

export const meta: MetaFunction = () => {
	return [
		{ title: 'Create Character' }
	]
}

export async function loader({ request }: LoaderFunctionArgs) {
	const { headers } = await requireAccount(request)
	return json({}, { headers })
}

export async function action({ request }: ActionFunctionArgs) {
	const { supabase, headers } = await requireAccount(request)

	const formData = await request.formData()
	const characterName = formData.get('character_name')
	if (typeof characterName !== 'string' || characterName.length <= 0 || characterName.length > 32) {
		return {
			errorMessage: 'Invalid Character Name',
			component: 'character_name'
		}
	}

	const { data, error } = await supabase
		.from('characters')
		.insert({ character_name: characterName })
		.select()
	if (error) throw new Error(error.message, { cause: error })

	const { character_id } = data[0]

	return redirect(`/character/${character_id}`, { headers })
}

export default function CharacterCreate() {
	const { errorMessage, component } = useActionData<typeof action>() ?? {}

	return (
		<Stack>
			<Title>Create Character</Title>

			<Form method='POST'>
				<Group align='center'>
					<TextInput
						label='Character Name'
						w={rem(240)}
						name='character_name'
						error={component === 'character_name' && errorMessage}
						rightSection={(
							<ActionIcon type='submit'>
								<IconCirclePlusFilled />
							</ActionIcon>
						)}
					/>
				</Group>
			</Form>

		</Stack>
	)
}
