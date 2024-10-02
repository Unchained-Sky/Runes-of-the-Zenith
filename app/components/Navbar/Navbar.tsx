import { Box, Code, Group, rem, ScrollArea, Stack, Text } from '@mantine/core'
import { type UserIdentityData } from '~/supabase/getUserIdentity'
import LinkGroup from './LinkGroup'
import { navbarLinks } from './navbarLinks'
import UserButton from './UserButton'

const mx = 'calc(var(--mantine-spacing-md) * -1)'
const border = `${rem('1px')} solid var(--mantine-color-dark-4)`

type NavbarProps = {
	userIdentity: UserIdentityData
}

export default function Navbar({ userIdentity }: NavbarProps) {
	return (
		<Stack
			component='nav'
			h='100vh'
			w={300}
			p='md'
			pb={0}
			bg='dark.6'
		>
			<Header />
			<Links />
			<User userIdentity={userIdentity} />
		</Stack>
	)
}

function Header() {
	return (
		<Box
			p='md'
			pt='0'
			mx={mx}
			style={{
				borderBottom: border
			}}
		>
			<Group align='center'>
				<Text fw={700} size='lg' flex='1' ff='CaeserDressing'>Runes of the Zenith</Text>
				<Code fw={700}>v0.1.0</Code>
			</Group>
		</Box>
	)
}

function Links() {
	return (
		<ScrollArea flex='1' mx={mx}>
			{
				navbarLinks.map(navbarLink => {
					return <LinkGroup key={navbarLink.label} {...navbarLink} />
				})
			}
		</ScrollArea>
	)
}

type UserProps = {
	userIdentity: UserIdentityData
}

function User({ userIdentity }: UserProps) {
	return (
		<Box
			mx={mx}
			style={{
				borderTop: border
			}}
		>
			<UserButton userIdentity={userIdentity} />
		</Box>
	)
}
