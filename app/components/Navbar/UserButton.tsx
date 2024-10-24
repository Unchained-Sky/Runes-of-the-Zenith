import { Avatar, Box, Group, Menu, Text, UnstyledButton } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { Form } from '@remix-run/react'
import { IconChevronRight, IconUser } from '@tabler/icons-react'
import { forwardRef } from 'react'
import { type UserIdentityData } from '~/supabase/getUserIdentity'
import { iconSize } from '~/utils/iconSize'
import classes from './UserButton.module.css'

type UserButtonProps = {
	userIdentity: UserIdentityData
}

export default function UserButton({ userIdentity }: UserButtonProps) {
	const [menuOpened, { toggle }] = useDisclosure(false)

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
		<Form method='POST' action='/auth/login'>
			<input type='text' name='_intent' value='discord' hidden readOnly />
			<UnstyledButton className={classes.user} ta='center' type='submit'>Login with Discord</UnstyledButton>
		</Form>
	)
}

type UserProps = {
	toggle: () => void
	userIdentity: NonNullable<UserIdentityData>
}

const User = forwardRef<HTMLButtonElement, UserProps>(function User({ toggle, userIdentity }, ref) {
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
						0 Campaigns
					</Text>

					<Text c='dimmed' size='xs'>
						0 Character
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
			<Form method='POST' action='/auth/logout'>
				<Menu.Item
					leftSection={<IconUser style={iconSize(14)} />}
					type='submit'
				>
					Logout
				</Menu.Item>
			</Form>
		</Menu.Dropdown>
	)
}
