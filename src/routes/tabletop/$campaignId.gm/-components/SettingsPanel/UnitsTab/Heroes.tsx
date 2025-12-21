import { SimpleGrid, Title } from '@mantine/core'
import { useMutation } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { type } from 'arktype'
import { getServiceClient } from '~/supabase/getServiceClient'
import { requireGM } from '~/supabase/requireGM'
import { mutationError } from '~/utils/mutationError'
import { useTabletopHeroes } from '../../../-hooks/tabletopData/useTabletopHeroes'
import CharacterCard from './CharacterCard'

export default function Heroes() {
	const { data: heroesData } = useTabletopHeroes()

	const removeHero = useMutation({
		mutationFn: removeHeroAction,
		onError: error => {
			mutationError(error, 'Failed to remove hero')
		}
	})

	return (
		<>
			<Title order={3}>Heroes</Title>
			<SimpleGrid cols={3}>
				{Object.values(heroesData).map(heroData => {
					return (
						<CharacterCard
							key={heroData.heroId}
							character={{
								type: 'HERO',
								tabletopCharacterId: heroData.tabletopCharacterId,
								characterName: heroData.heroName,
								stats: heroData.stats,
								tabletopStats: heroData.tabletopStats,
								pos: heroData.pos
							}}
							removeCharacter={() => removeHero.mutate({ data: { tabletopCharacterId: heroData.tabletopCharacterId } })}
						/>
					)
				})}
			</SimpleGrid>
		</>
	)
}

const removeHeroSchema = type({
	tabletopCharacterId: 'number'
})

const removeHeroAction = createServerFn({ method: 'POST' })
	.validator(removeHeroSchema)
	.handler(async ({ data: { tabletopCharacterId } }) => {
		await requireGM({ tabletopCharacterId })

		const serviceClient = getServiceClient()

		const { error } = await serviceClient
			.from('tabletop_characters')
			.delete()
			.eq('tt_character_id', tabletopCharacterId)
		if (error) throw new Error(error.message, { cause: error })
	})
