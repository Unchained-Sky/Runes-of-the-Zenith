import { Avatar, Box, Group, rem, Text, UnstyledButton } from '@mantine/core'
import { Link } from '@remix-run/react'
import { IconChevronRight } from '@tabler/icons-react'
import classes from './UserButton.module.css'

export default function UserButton() {
	return (
		<UnstyledButton className={classes.user} component={Link} to='/'>
			<Group>
				<Avatar
					src='https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-8.png'
					radius='xl'
				/>

				<Box flex='1'>
					<Text size='sm' fw={500}>
						Test User
					</Text>

					<Text c='dimmed' size='xs'>
						0 Campaigns
					</Text>

					<Text c='dimmed' size='xs'>
						0 Character
					</Text>
				</Box>

				<IconChevronRight
					stroke={1.5}
					width={rem(14)}
					height={rem(14)}
				/>
			</Group>
		</UnstyledButton>
	)
}
