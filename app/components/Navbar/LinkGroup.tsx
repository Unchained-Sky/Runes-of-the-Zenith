import { Box, Collapse, type ElementProps, Group, type PolymorphicComponentProps, ThemeIcon, UnstyledButton, type UnstyledButtonProps } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { Link } from '@remix-run/react'
import { type RemixLinkProps } from '@remix-run/react/dist/components'
import { IconChevronRight } from '@tabler/icons-react'
import { iconSize } from '~/utils/iconSize'
import classes from './LinkGroup.module.css'
import { type NavLink, type NestedLink } from './navbarLinks'

function isNestedLink(navLink: NavLink): navLink is NestedLink {
	return Object.hasOwn(navLink, 'links')
}

type ButtonProps = ElementProps<'button', keyof UnstyledButtonProps>

export default function LinkGroup(navLink: NavLink) {
	const { label, icon: Icon } = navLink

	const [opened, { toggle }] = useDisclosure(false)

	const props = isNestedLink(navLink)
		? {
			onClick: () => toggle(),
			to: '/'
		} satisfies PolymorphicComponentProps<'button', UnstyledButtonProps & ButtonProps> & { to: string }
		: {
			component: Link,
			to: navLink.link
		} satisfies PolymorphicComponentProps<RemixLinkProps, RemixLinkProps & ButtonProps>

	return (
		<>
			<UnstyledButton className={classes.control} {...props}>
				<Group justify='space-between' gap={0}>
					<Group align='center' gap={0}>
						<ThemeIcon>
							<Icon style={iconSize(18)} />
						</ThemeIcon>
						<Box ml='md'>{label}</Box>
					</Group>
					{
						isNestedLink(navLink) && (
							<IconChevronRight
								stroke={1.5}
								style={{
									...iconSize(16),
									transform: opened ? 'rotate(-90deg)' : 'none',
									transition: 'transform 200ms ease'
								}}
							/>
						)
					}
				</Group>
			</UnstyledButton>

			{
				isNestedLink(navLink) && (
					<Collapse in={opened}>
						{
							navLink.links.map(({ label, link }) => {
								return (
									<Link key={label} className={classes.link} to={link}>
										{label}
									</Link>
								)
							})
						}
					</Collapse>
				)
			}
		</>
	)
}
