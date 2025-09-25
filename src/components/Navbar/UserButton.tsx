import { Avatar, Box, Group, Menu, Text, UnstyledButton } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { IconChevronRight, IconUser } from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { forwardRef, Fragment } from 'react'
import { getSupabaseServerClient } from '~/supabase/getSupabaseServerClient'
import { iconSize } from '~/utils/iconSize'
import classes from './UserButton.module.css'

export default function UserButton() {
	const [menuOpened, { toggle }] = useDisclosure(false)

	const { data: userIdentity, isLoading } = useQuery({
		queryKey: ['navbar', 'userIdentity'],
		queryFn: getUserIdentity
	})

	if (isLoading) return null

	return userIdentity
		? (
			<Menu position='right-end' opened={menuOpened}>
				<Menu.Target>
					<User toggle={toggle} userIdentity={userIdentity} />
				</Menu.Target>

				<MenuDropdown />
			</Menu>
		)
		: <Login />
}

function Login() {
	return (
		<Fragment>
			<input type='text' name='_intent' value='discord' hidden readOnly />
			<UnstyledButton className={classes.user} ta='center' type='submit' component={Link} to='/auth/login'>Login with Discord</UnstyledButton>
		</Fragment>
	)
}

type UserProps = {
	userIdentity: UserIdentityData
	toggle: () => void
}

const User = forwardRef<HTMLButtonElement, UserProps>(function User({ userIdentity, toggle }, ref) {
	const { data: campaignCount } = useQuery({
		queryKey: ['navbar', 'campaignCount'],
		queryFn: getCampaignCount,
		placeholderData: () => 0
	})

	const { data: heroCount } = useQuery({
		queryKey: ['navbar', 'heroCount'],
		queryFn: getHeroCount,
		placeholderData: () => 0
	})

	if (!userIdentity) return null

	return (
		<UnstyledButton className={classes.user} ref={ref} onClick={toggle}>
			<Group>
				<Avatar
					src={userIdentity.avatar_url}
					radius='xl'
				/>

				<Box flex='1'>
					<Text size='sm' fw={500}>
						{userIdentity.custom_claims.global_name}
					</Text>

					<Text c='dimmed' size='xs'>
						{campaignCount} Campaign{campaignCount === 1 ? '' : 's'}
					</Text>

					<Text c='dimmed' size='xs'>
						{heroCount} Hero{heroCount === 1 ? '' : 'es'}
					</Text>
				</Box>

				<IconChevronRight stroke={1.5} style={iconSize(14)} />
			</Group>
		</UnstyledButton>
	)
})

function MenuDropdown() {
	return (
		<Menu.Dropdown>
			<Menu.Label>Account</Menu.Label>
			<Menu.Item
				leftSection={<IconUser style={iconSize(14)} />}
				type='submit'
				component={Link}
				to='/auth/logout'
			>
				Logout
			</Menu.Item>
		</Menu.Dropdown>
	)
}

type UserIdentityData = UserIdentityDiscordData | null

type UserIdentityDiscordData = {
	avatar_url: string
	custom_claims: {
		global_name: string
	}
	email: string
	email_verified: boolean
	full_name: string
	iss: string
	name: string
	picture: string
	provider_id: string
	sub: string
}

const getUserIdentity = createServerFn({ method: 'GET' }).handler(async () => {
	const supabase = getSupabaseServerClient()
	const { data } = await supabase.auth.getUserIdentities()
	const identityData = data?.identities[0]?.identity_data ?? null
	return identityData as UserIdentityData
})

const getCampaignCount = createServerFn({ method: 'GET' })
	.handler(async () => {
		const supabase = getSupabaseServerClient()

		const { data: userData } = await supabase.auth.getUser()
		if (!userData.user) return 0

		const { count: campaignCount } = await supabase
			.from('campaign_info')
			.select('', { count: 'exact' })

		return campaignCount ?? 0
	})

const getHeroCount = createServerFn({ method: 'GET' })
	.handler(async () => {
		const supabase = getSupabaseServerClient()

		const { data: userData } = await supabase.auth.getUser()
		if (!userData.user) return 0

		const { count: heroCount } = await supabase
			.from('hero_info')
			.select('', { count: 'exact' })
			.eq('user_id', userData.user.id)

		return heroCount ?? 0
	})
