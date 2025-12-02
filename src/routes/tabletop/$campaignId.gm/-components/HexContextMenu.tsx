import { Menu } from '@mantine/core'
import { useMutation } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { type } from 'arktype'
import { Fragment, type ReactNode } from 'react'
import ContextMenu from '~/components/ContextMenu'
import { type TablesInsert } from '~/supabase/databaseTypes'
import { getServiceClient } from '~/supabase/getServiceClient'
import { requireGM } from '~/supabase/requireGM'
import { type CombatTileCord } from '~/types/gameTypes/combatMap'
import { mutationError } from '~/utils/mutationError'
import { useTabletopHeroes } from '../-hooks/tabletopData/useTabletopHeroes'
import { useTabletopTiles } from '../-hooks/tabletopData/useTabletopTiles'

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

	const { data: heroesData } = useTabletopHeroes()
	const inactiveHeroes = heroesData.getInactive()

	const addHero = useMutation({
		mutationFn: addHeroAction,
		onError: error => {
			mutationError(error, 'Failed to add hero')
		}
	})

	const { data: tilesData } = useTabletopTiles()
	const tile = tilesData[`${cord[0]},${cord[1]},${cord[2]}`]

	return (
		<Menu.Sub>
			<Menu.Sub.Target>
				<Menu.Sub.Item disabled={!inactiveHeroes.length || !!tile?.characterType}>Add Hero</Menu.Sub.Item>
			</Menu.Sub.Target>

			<Menu.Sub.Dropdown>
				{inactiveHeroes.map(heroId => {
					const heroData = heroesData.getFromHeroId(heroId)
					return (
						<Menu.Item
							key={heroId}
							onClick={() => addHero.mutate({
								data: {
									heroId,
									campaignId,
									cord
								}
							})}
						>
							{heroData.heroName}
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
		const { supabase } = await requireGM({ campaignId })

		const serviceClient = getServiceClient()

		{
			// Check if the tile is already occupied
			const { data, error } = await supabase
				.from('tabletop_tiles')
				.select('characterId: tt_character_id')
				.eq('q', q)
				.eq('r', r)
				.eq('s', s)
				.limit(1)
				.maybeSingle()
			if (error) throw new Error(error.message, { cause: error })
			if (data?.characterId) throw new Error('Tile already has a character')
		}

		const getCharacterId = async () => {
			const { data: characterData, error: characterError } = await supabase
				.from('tabletop_heroes')
				.select(`
					tabletopCharacters: tabletop_characters (
						characterId: tt_character_id
					),
					heroInfo: hero_info (
						characterInfo: character_info (
							maxHealth: max_health,
							maxShield: max_shield
						)
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
					character_type: 'HERO',
					health: characterData?.heroInfo.characterInfo.maxHealth ?? 0,
					shield: characterData?.heroInfo.characterInfo.maxShield ?? 0
				})
				.select('characterId: tt_character_id')
				.limit(1)
				.single()
			if (characterInsertError) throw new Error(characterInsertError.message, { cause: characterInsertError })

			const { error: heroInsertError } = await serviceClient
				.from('tabletop_heroes')
				.insert({
					hero_id: heroId,
					tt_character_id: data.characterId
				} satisfies TablesInsert<'tabletop_heroes'>)
			if (heroInsertError) throw new Error(heroInsertError.message, { cause: heroInsertError })

			return data.characterId
		}

		const characterId = await getCharacterId()

		{
			// Check if the hero is already on the map
			const { count } = await supabase
				.from('tabletop_tiles')
				.select('', { count: 'exact' })
				.eq('tt_character_id', characterId)
			if (count) throw new Error('Character already has a tile')
		}

		{
			// Insert the hero on the tile
			const { error } = await serviceClient
				.from('tabletop_tiles')
				.upsert({
					campaign_id: campaignId,
					q,
					r,
					s,
					tt_character_id: characterId
				} satisfies TablesInsert<'tabletop_tiles'>)
			if (error) throw new Error(error.message, { cause: error })
		}
	})
