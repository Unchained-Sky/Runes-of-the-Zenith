import { IconBook, IconCampfire, IconCoffee, IconHome, IconUser, type Icon } from '@tabler/icons-react'
import { type LinkComponentProps } from '@tanstack/react-router'

type LinkPath = LinkComponentProps['to']

export type MainLink = {
	label: string
	icon: Icon
	link: LinkPath
}

export type NestedLink = {
	label: string
	icon: Icon
	links: {
		label: string
		link: LinkPath
	}[]
}

export type NavLink = MainLink | NestedLink

export const navbarLinks = [
	{ label: 'Home', icon: IconHome, link: '/' },
	{ label: 'Campaigns', icon: IconCampfire, link: '/campaign' },
	{ label: 'Heroes', icon: IconUser, link: '/hero' },
	{ label: 'Homebrew', icon: IconCoffee, links: [
		{ label: 'Encounters', link: '/' },
		{ label: 'Maps', link: '/homebrew/map' },
		{ label: 'Enemies', link: '/' }
	] },
	{ label: 'Rules', icon: IconBook, links: [
		{ label: 'Talents', link: '/' },
		{ label: 'Runes', link: '/' },
		{ label: 'Monsters', link: '/' }
	] }
] as const satisfies NavLink[]
