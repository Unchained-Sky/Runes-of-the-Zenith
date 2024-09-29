import { type LoaderFunctionArgs } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { getServerClient } from 'app/supabase/getServerClient'
import Login from '~/components/Login'
import Logout from '~/components/Logout'

export async function loader({ request }: LoaderFunctionArgs) {
	const { supabase } = getServerClient(request)
	const { data: { user } } = await supabase.auth.getUser()
	return { user, request }
}

export default function TestPage() {
	const { user } = useLoaderData<typeof loader>()

	return user
		? <Logout />
		: <Login />
}
