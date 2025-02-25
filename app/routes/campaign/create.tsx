import { ActionIcon, Group, rem, Stack, TextInput, Title } from '@mantine/core'
import { type ActionFunctionArgs, type LoaderFunctionArgs } from '@remix-run/node'
import { Form, redirect, useActionData, type MetaFunction } from '@remix-run/react'
import { IconCirclePlusFilled } from '@tabler/icons-react'
import { requireAccount } from '~/supabase/requireAccount'

export const meta: MetaFunction = () => {
	return [
		{ title: 'Create Campaigns' }
	]
}

export async function loader({ request }: LoaderFunctionArgs) {
	await requireAccount(request)
	return {}
}

export async function action({ request }: ActionFunctionArgs) {
	const { supabase, headers } = await requireAccount(request)

	const formData = await request.formData()
	const campaignName = formData.get('campaign_name')
	if (typeof campaignName !== 'string' || campaignName.length <= 0 || campaignName.length > 32) {
		return {
			errorMessage: 'Invalid Campaign Name',
			component: 'campaign_name'
		}
	}

	const { data, error } = await supabase
		.from('campaign_info')
		.insert({ campaign_name: campaignName })
		.select()
	if (error) throw new Error(error.message, { cause: error })

	const { campaign_id } = data[0]

	return redirect(`/campaign/${campaign_id}`, { headers })
}

export default function Route() {
	const { errorMessage, component } = useActionData<typeof action>() ?? {}

	return (
		<Stack>
			<Title>Create Campaign</Title>

			<Form method='POST'>
				<Group align='center'>
					<TextInput
						label='Campaign Name'
						w={rem(240)}
						name='campaign_name'
						error={component === 'campaign_name' && errorMessage}
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
