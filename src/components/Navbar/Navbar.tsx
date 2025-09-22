import { Box, Code, Group, rem, ScrollArea, Stack, Text } from '@mantine/core'
import { Fragment } from 'react'
import LinkGroup from './LinkGroup'
import { navbarLinks } from './navbarLinks'
import UserButton from './UserButton'

const mx = 'calc(var(--mantine-spacing-md) * -1)'
const border = `${rem('1px')} solid var(--mantine-color-dark-4)`

export default function Navbar() {
	return (
		<Fragment>
			<Stack
				component='nav'
				h='100vh'
				w={300}
				p='md'
				pb={0}
				bg='dark.6'
				pos='fixed'
			>
				<Header />
				<Links />
				<User />
			</Stack>

			<Box h='100vh' w={300} />
		</Fragment>
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
				<Code fw={700}>v0.2.0</Code>
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

function User() {
	return (
		<Box
			mx={mx}
			style={{
				borderTop: border
			}}
		>
			<UserButton />
		</Box>
	)
}
