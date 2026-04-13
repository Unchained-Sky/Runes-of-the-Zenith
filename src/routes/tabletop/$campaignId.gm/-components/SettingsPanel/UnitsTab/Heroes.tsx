import { SimpleGrid, Title } from '@mantine/core'
import { useMutation } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { type } from 'arktype'
import { useTabletopContext } from '~/routes/tabletop/-utils/TabletopContext'
import { getServiceClient } from '~/supabase/getServiceClient'
import { requireGM } from '~/supabase/requireGM'
import { useTabletopHeroes } from '~/tt/-hooks/tabletopData/useTabletopHeroes'
import { type TabletopHeroesList } from '~/tt/-hooks/tabletopData/useTabletopHeroList'
import { mutationError } from '~/utils/mutationError'
import CharacterCard from './CharacterCard'

export default function Heroes() {
	const { queryClient, campaignId } = useTabletopContext()

	const { data: heroesData } = useTabletopHeroes()

	const removeHero = useMutation({
		mutationFn: removeHeroAction,
		onMutate: ({ data }) => {
			const { tabletopCharacterId } = data

			void queryClient.cancelQueries({ queryKey: [campaignId, 'tabletop', 'hero-list'] })
			queryClient.setQueriesData({ queryKey: [campaignId, 'tabletop', 'hero-list'] }, (oldData: TabletopHeroesList) => {
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

			void queryClient.cancelQueries({ queryKey: [campaignId, 'tabletop', 'hero', tabletopCharacterId] })
			queryClient.removeQueries({ queryKey: [campaignId, 'tabletop', 'hero', tabletopCharacterId] })
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
