import { Avatar, Box, Group, Menu, Text, UnstyledButton } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { Form } from '@remix-run/react'
import { IconChevronRight, IconUser } from '@tabler/icons-react'
import { forwardRef, useContext } from 'react'
import { iconSize } from '~/utils/iconSize'
import { NavbarContext } from './NavbarContext'
import classes from './UserButton.module.css'

export default function UserButton() {
	const [menuOpened, { toggle }] = useDisclosure(false)

	const { userIdentity } = useContext(NavbarContext)

	return userIdentity
		? (
			<Menu position='right-end' opened={menuOpened}>
				<Menu.Target>
					<User toggle={toggle} />
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
}

const User = forwardRef<HTMLButtonElement, UserProps>(function User({ toggle }, ref) {
	const { userIdentity, campaignCount, characterCount } = useContext(NavbarContext)
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
						{campaignCount} Campaigns
					</Text>

					<Text c='dimmed' size='xs'>
						{characterCount} Character
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
