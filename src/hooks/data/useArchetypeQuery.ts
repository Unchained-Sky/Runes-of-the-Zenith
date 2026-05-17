import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { type Enums } from '~/supabase/databaseTypes'
import { getSupabaseServerClient } from '~/supabase/getSupabaseServerClient'

const archetypeQueryAction = createServerFn({ method: 'GET' })
	.handler(async () => {
		const supabase = getSupabaseServerClient()

		const { data, error } = await supabase
			.from('rune_archetypes')
			.select('*')
		if (error) throw new Error(error.message, { cause: error })

		return data.reduce<Test>((acc, curr) => {
			return {
				...acc,
				[curr.subarchetype]: {
					archetype: curr.archetype,
					damageType: curr.damage_type
				}
			}
		}, {} as Test)
	})

type Test = Record<Enums<'subarchetype'>, {
	archetype: Enums<'archetype'>
	damageType: Enums<'damage_type'>
}>

export const archetypeQueryOptions = queryOptions({
	queryKey: ['core-data', 'archetype'],
	queryFn: archetypeQueryAction,
	staleTime: Infinity
})

export const useArchetypeQuery = () => {
	return useSuspenseQuery(archetypeQueryOptions).data
}
