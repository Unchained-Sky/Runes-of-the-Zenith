import { Menu } from '@mantine/core'
import { useMutation } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { type } from 'arktype'
import { Fragment, type ReactNode } from 'react'
import ContextMenu from '~/components/ContextMenu'
import { type CombatTileCord } from '~/data/mapTemplates/combat'
import { getSupabaseServerClient } from '~/supabase/getSupabaseServerClient'
import { useTabletopCharacters } from '../-hooks/-useTabletopData'

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
					<Characters cord={cord} />
				</Fragment>
			)}
		>
			{children}
		</ContextMenu>
	)
}

type CharactersProps = {
	cord: CombatTileCord
}

function Characters({ cord }: CharactersProps) {
	const { data: characters } = useTabletopCharacters()

	const inactiveCharacters = Object.values(characters)
		.filter(({ tabletop_characters }) => tabletop_characters === null)

	const addCharacter = useMutation({
		mutationFn: addCharacterAction
	})

	return (
		<Menu.Sub>
			<Menu.Sub.Target>
				<Menu.Sub.Item disabled={!inactiveCharacters.length}>Add Character</Menu.Sub.Item>
			</Menu.Sub.Target>

			<Menu.Sub.Dropdown>
				{inactiveCharacters.map(character => {
					return (
						<Menu.Item
							key={character.character_id}
							onClick={() => addCharacter.mutate({
								data: {
									characterId: character.character_id,
									cord
								}
							})}
						>
							{character.character_name}
						</Menu.Item>
					)
				})}
			</Menu.Sub.Dropdown>
		</Menu.Sub>
	)
}

const addCharacterSchema = type({
	characterId: 'number',
	cord: ['number', 'number', 'number']
})

const addCharacterAction = createServerFn({ method: 'POST' })
	.validator(addCharacterSchema)
	.handler(async ({ data: { characterId, cord: [q, r, s] } }) => {
		const supabase = getSupabaseServerClient()

		const { error } = await supabase
			.from('tabletop_characters')
			.upsert({
				character_id: characterId,
				position_q: q,
				position_r: r,
				position_s: s
			})
		if (error) throw new Error(error.message, { cause: error })
	})
