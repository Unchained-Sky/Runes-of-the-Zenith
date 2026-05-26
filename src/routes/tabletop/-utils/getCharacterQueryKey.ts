import { type QueryClient } from '@tanstack/react-query'
import { type Enums } from '~/supabase/databaseTypes'
import { queryCharacterLookup } from './characterLookup'

type GetCharacterQueryKeyProps = {
	queryClient: QueryClient
	campaignId: number
	tabletopCharacterId: number
}

export default function getCharacterQueryKey(props: GetCharacterQueryKeyProps) {
	const characterType = queryCharacterLookup(props)
	const queryKey = queryKeySwitch({ campaignId: props.campaignId, tabletopCharacterId: props.tabletopCharacterId, characterType })
	return {
		queryKey,
		characterType
	}
}

type QueryKeySwitchProps = {
	campaignId: number
	tabletopCharacterId: number
	characterType: Enums<'character_type'>
}

function queryKeySwitch({ campaignId, tabletopCharacterId, characterType }: QueryKeySwitchProps) {
	switch (characterType) {
		case 'HERO': return [campaignId, 'tabletop', 'hero', tabletopCharacterId] as const
		case 'ENEMY': return [campaignId, 'tabletop-gm', 'enemy', tabletopCharacterId] as const
	}
}
