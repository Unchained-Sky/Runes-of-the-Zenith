import { SimpleGrid, Title } from '@mantine/core'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { type } from 'arktype'
import getQueryKey from '~/routes/tabletop/-utils/getQueryKey'
import { getServiceClient } from '~/supabase/getServiceClient'
import { requireGM } from '~/supabase/requireGM'
import { useTabletopHeroes } from '~/tt/-hooks/tabletopData/useTabletopHeroes'
import { type TabletopHeroesList } from '~/tt/-hooks/tabletopData/useTabletopHeroList'
import { mutationError } from '~/utils/mutationError'
import CharacterCard from './CharacterCard'

export default function Heroes() {
	const queryClient = useQueryClient()

	const { data: heroesData } = useTabletopHeroes()

	const removeHero = useMutation({
		mutationFn: removeHeroAction,
		onMutate: ({ data }) => {
			const { tabletopCharacterId } = data

			{
				const queryKey = getQueryKey({ type: 'hero-list' })
				void queryClient.cancelQueries({ queryKey })
				queryClient.setQueriesData({ queryKey }, (oldData: TabletopHeroesList) => {
					const newData = structuredClone(oldData)
					for (let i = 0; i < newData.length; i++) {
						const hero = newData[i]
						if (hero?.tabletopCharacterId === tabletopCharacterId) {
							newData[i] = {
								...hero,
								tabletopCharacterId: null
							}
							break
						}
					}
					return newData satisfies TabletopHeroesList
				})
			}

			{
				const queryKey = getQueryKey({ type: 'hero', data: { tabletopCharacterId } })
				void queryClient.cancelQueries({ queryKey })
				queryClient.removeQueries({ queryKey })
			}
		},
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
								pos: heroData.pos,
								avatarUrl: heroData.avatarUrl
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
	.inputValidator(removeHeroSchema)
	.handler(async ({ data: { tabletopCharacterId } }) => {
		await requireGM({ tabletopCharacterId })

		const serviceClient = getServiceClient()

		const { error } = await serviceClient
			.from('tabletop_characters')
			.delete()
			.eq('tt_character_id', tabletopCharacterId)
		if (error) throw new Error(error.message, { cause: error })
	})
