import { Button, rem, Stack, Title } from '@mantine/core'
import { type LoaderFunctionArgs } from '@remix-run/node'
import { json, Link, type MetaFunction } from '@remix-run/react'
import { requireAccount } from '~/supabase/requireAccount'

export const meta: MetaFunction = () => {
	return [
		{ title: 'My Campaigns' }
	]
}

export async function loader({ request }: LoaderFunctionArgs) {
	const { headers } = await requireAccount(request)
	return json({}, { headers })
}

export default function Campaigns() {
	return (
		<Stack>
			<Title>My Campaigns</Title>

			<Button w={rem(240)} component={Link} to='/campaign/create'>Create Campaign</Button>
		</Stack>
	)
}
