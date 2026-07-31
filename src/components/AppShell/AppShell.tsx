import { Burger, AppShell as MantineAppShell, Text, Code, Group, ActionIcon } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { type ReactNode } from 'react'
import Links from './Links'
import UserButton from './UserButton'
import { IconBrandGithub } from '@tabler/icons-react'

type AppShellProps = {
	main: ReactNode
}

export default function AppShell({ main }: AppShellProps) {
	const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true)
	const [mobileOpened, { toggle: toggleMobile }] = useDisclosure(false)

	return (
		<MantineAppShell
			padding='md'
			header={{ height: 60 }}
			navbar={{
				width: 300,
				breakpoint: 'sm',
				collapsed: { mobile: !mobileOpened, desktop: !desktopOpened }
			}}
		>
			<Header desktopOpened={desktopOpened} toggleDesktop={toggleDesktop} mobileOpened={mobileOpened} toggleMobile={toggleMobile} />

			<Navbar />

			<MantineAppShell.Main>
				{main}
			</MantineAppShell.Main>
		</MantineAppShell>
	)
}

type HeaderProps = {
	desktopOpened: boolean
	toggleDesktop: () => void
	mobileOpened: boolean
	toggleMobile: () => void
}

function Header({ desktopOpened, toggleDesktop, mobileOpened, toggleMobile }: HeaderProps) {
	return (
		<MantineAppShell.Header bg='dark.6'>
			<Group py='sm' px='md' h='100%' justify='space-between'>
				<Group>
					<Burger opened={mobileOpened} onClick={toggleMobile} hiddenFrom='sm' size='sm' />
					<Burger opened={desktopOpened} onClick={toggleDesktop} visibleFrom='sm' size='sm' />
					<Text fw={700} size='lg' ff='CaeserDressing'>Runes of the Zenith</Text>
				</Group>
				<Group>
					<Code fw={700}>v0.2.1</Code>
					<ActionIcon
						variant='default'
						size='lg'
						component='a'
						href='https://github.com/Unchained-Sky/Runes-of-the-Zenith'
						target='_blank'
						aria-label='Open project GitHub in new tab'
					>
						<IconBrandGithub />
					</ActionIcon>
				</Group>
			</Group>
		</MantineAppShell.Header>
	)
}

function Navbar() {
	return (
		<MantineAppShell.Navbar bg='dark.6'>
			<Links />
			<UserButton />
		</MantineAppShell.Navbar>
	)
}
