import { Menu } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { useMutation } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { type } from 'arktype'
import { Fragment, type ReactNode } from 'react'
import ContextMenu from '~/components/ContextMenu'
import { getServiceClient } from '~/supabase/getServiceClient'
import { requireAccount } from '~/supabase/requireAccount'
import { type CombatTileCord } from '~/types/gameTypes/combatMap'
import { useTabletopHeroes } from '../-hooks/useTabletopData'

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
	const { campaignId } = getRouteApi('/tabletop/$campaignId/gm/').useLoaderData()
	const { data: heroes } = useTabletopHeroes()

	const inactiveHeroes = Object.values(heroes)
		.filter(({ tabletopHero }) => tabletopHero === null)

	const addHero = useMutation({
		mutationFn: addHeroAction,
		onError: error => {
			notifications.show({
				title: 'Failed to add hero',
				color: 'red',
				message: error.message
			})
		}
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
							key={hero.heroId}
							onClick={() => addHero.mutate({
								data: {
									heroId: hero.heroId,
									campaignId,
									cord
								}
							})}
						>
							{hero.heroName}
						</Menu.Item>
					)
				})}
			</Menu.Sub.Dropdown>
		</Menu.Sub>
	)
}

const addHeroSchema = type({
	heroId: 'number',
	campaignId: 'number',
	cord: ['number', 'number', 'number']
})

const addHeroAction = createServerFn({ method: 'POST' })
	.validator(addHeroSchema)
	.handler(async ({ data: { heroId, campaignId, cord: [q, r, s] } }) => {
		const { supabase, user } = await requireAccount()

		// Check if the user is the GM
		const gmCheck = await supabase
			.from('campaign_info')
			.select('gmUserId: user_id')
			.eq('campaign_id', campaignId)
			.limit(1)
			.single()
		if (gmCheck.error) throw new Error(gmCheck.error.message, { cause: gmCheck.error })
		if (gmCheck.data.gmUserId !== user.id) throw new Error('You are not the GM of this campaign')

		const serviceClient = getServiceClient()

		// Check if the tile is already occupied
		const tileCharacter = await supabase
			.from('tabletop_tiles')
			.select('characterId: tt_character_id')
			.eq('q', q)
			.eq('r', r)
			.eq('s', s)
			.limit(1)
			.maybeSingle()
		if (tileCharacter.error) throw new Error(tileCharacter.error.message, { cause: tileCharacter.error })
		if (tileCharacter.data?.characterId) throw new Error('Tile already has a character')

		const getCharacterId = async () => {
			const { data: characterData, error: characterError } = await supabase
				.from('tabletop_heroes')
				.select(`
					tabletopCharacters: tabletop_characters (
						characterId: tt_character_id
					)
				`)
				.eq('hero_id', heroId)
				.limit(1)
				.maybeSingle()
			if (characterError) throw new Error(characterError.message, { cause: characterError })

			if (characterData?.tabletopCharacters.characterId) return characterData.tabletopCharacters.characterId

			const { data, error: characterInsertError } = await serviceClient
				.from('tabletop_characters')
				.insert({
					campaign_id: campaignId,
					character_type: 'HERO'
				})
				.select('characterId: tt_character_id')
				.single()
			if (characterInsertError) throw new Error(characterInsertError.message, { cause: characterInsertError })

			const { error: heroInsertError } = await serviceClient
				.from('tabletop_heroes')
				.insert({
					hero_id: heroId,
					tt_character_id: data.characterId
				})
			if (heroInsertError) throw new Error(heroInsertError.message, { cause: heroInsertError })

			return data.characterId
		}

		const characterId = await getCharacterId()

		// Check if the hero is already on the map
		const { count: characterTileCount } = await supabase
			.from('tabletop_tiles')
			.select('', { count: 'exact' })
			.eq('character_id', characterId)
		if (characterTileCount) throw new Error('Character already has a tile')

		// Insert the hero on the tile
		const { error: tileInsertError } = await serviceClient
			.from('tabletop_tiles')
			.upsert({
				campaign_id: campaignId,
				q,
				r,
				s,
				character_id: characterId
			})
		if (tileInsertError) throw new Error(tileInsertError.message, { cause: tileInsertError })
	})
