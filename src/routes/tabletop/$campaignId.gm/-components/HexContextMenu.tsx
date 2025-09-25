import { Menu } from '@mantine/core'
import { useMutation } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { type } from 'arktype'
import { Fragment, type ReactNode } from 'react'
import ContextMenu from '~/components/ContextMenu'
import { type CombatTileCord } from '~/data/mapTemplates/combat'
import { getSupabaseServerClient } from '~/supabase/getSupabaseServerClient'
import { useTabletopHeroes } from '../-hooks/-useTabletopData'

type HexContextMenuProps = {
	children: ReactNode
	cord: CombatTileCord
}

export default function HexContextMenu({ children, cord }: HexContextMenuProps) {
	return (
		<ContextMenu
			menuItems={(
				<Fragment>
					<Menu.Label>Units</Menu.Label>
					<Heroes cord={cord} />
				</Fragment>
			)}
		>
			{children}
		</ContextMenu>
	)
}

type HeroesProps = {
	cord: CombatTileCord
}

function Heroes({ cord }: HeroesProps) {
	const { data: heroes } = useTabletopHeroes()

	const inactiveHeroes = Object.values(heroes)
		.filter(({ tabletop_heroes }) => tabletop_heroes === null)

	const addHero = useMutation({
		mutationFn: addHeroAction
	})

	return (
		<Menu.Sub>
			<Menu.Sub.Target>
				<Menu.Sub.Item disabled={!inactiveHeroes.length}>Add Hero</Menu.Sub.Item>
			</Menu.Sub.Target>

			<Menu.Sub.Dropdown>
				{inactiveHeroes.map(hero => {
					return (
						<Menu.Item
							key={hero.hero_id}
							onClick={() => addHero.mutate({
								data: {
									heroId: hero.hero_id,
									cord
								}
							})}
						>
							{hero.hero_name}
						</Menu.Item>
					)
				})}
			</Menu.Sub.Dropdown>
		</Menu.Sub>
	)
}

const addHeroSchema = type({
	heroId: 'number',
	cord: ['number', 'number', 'number']
})

const addHeroAction = createServerFn({ method: 'POST' })
	.validator(addHeroSchema)
	.handler(async ({ data: { heroId, cord: [q, r, s] } }) => {
		const supabase = getSupabaseServerClient()

		const { error } = await supabase
			.from('tabletop_heroes')
			.upsert({
				hero_id: heroId,
				position_q: q,
				position_r: r,
				position_s: s
			})
		if (error) throw new Error(error.message, { cause: error })
	})
