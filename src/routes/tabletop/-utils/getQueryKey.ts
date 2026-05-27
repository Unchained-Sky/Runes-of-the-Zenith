import { type QueryClient } from '@tanstack/react-query'
import { type Enums } from '~/supabase/databaseTypes'
import { lowerCase } from '~/utils/stringCase'
import { useTabletopEnvironmentStore } from '../-hooks/useTabletopEnvironmentStore'
import { queryCharacterLookup } from './characterLookup'

type CampaignId = number

type QueryKeyConfig = {
	'enemy': {
		data: { tabletopCharacterId: number }
		return: [CampaignId, `tabletop-${'gm' | 'player'}`, 'enemy', number]
	}
	'enemy-list': {
		data: undefined
		return: [CampaignId, 'tabletop', 'enemy-list']
	}
	'hero': {
		data: { tabletopCharacterId: number | null }
		return: [CampaignId, 'tabletop', 'hero'] | [CampaignId, 'tabletop', 'hero', number]
	}
	'hero-list': {
		data: undefined
		return: [CampaignId, 'tabletop', 'hero-list']
	}
	'character': {
		data: { queryClient: QueryClient, tabletopCharacterId: number }
		return: {
			queryKey: QueryKeyConfig['hero']['return'] | QueryKeyConfig['enemy']['return']
			characterType: Enums<'character_type'>
		}
	}
	'tiles-map': {
		data: undefined
		return: [CampaignId, 'tabletop', 'tiles', 'map']
	}
	'round': {
		data: undefined
		return: [CampaignId, 'tabletop', 'round']
	}
	'tiles-character': {
		data: undefined
		return: [CampaignId, 'tabletop', 'tiles', 'characters']
	}
	'encounter-name': {
		data: undefined
		return: [CampaignId, 'tabletop', 'encounter-name']
	}
	'encounter-list': {
		data: undefined
		return: [CampaignId, 'tabletop', 'encounter-list']
	}
}

type QueryKeyArgs<T extends keyof QueryKeyConfig> = [QueryKeyConfig[T]['data']] extends [never]
	? { type: T }
	: QueryKeyConfig[T]['data'] extends undefined
		? { type: T }
		: { type: T, data: QueryKeyConfig[T]['data'] }

export default function getQueryKey<T extends keyof QueryKeyConfig>(props: QueryKeyArgs<T>): QueryKeyConfig[T]['return'] {
	const { campaignId, role } = useTabletopEnvironmentStore.getState()
	const typedProps = props as { [K in keyof QueryKeyConfig]: QueryKeyArgs<K> }[keyof QueryKeyConfig]

	switch (typedProps.type) {
		case 'enemy': return [campaignId, `tabletop-${role}`, 'enemy', typedProps.data.tabletopCharacterId] as const
		case 'enemy-list': return [campaignId, 'tabletop', 'enemy-list'] as const
		case 'hero': {
			if (!typedProps.data.tabletopCharacterId) return [campaignId, 'tabletop', 'hero'] as const
			return [campaignId, 'tabletop', 'hero', typedProps.data.tabletopCharacterId] as const
		}
		case 'hero-list': return [campaignId, 'tabletop', 'hero-list'] as const
		case 'character': {
			const characterType = queryCharacterLookup({ queryClient: typedProps.data.queryClient, tabletopCharacterId: typedProps.data.tabletopCharacterId })
			const queryKey = getQueryKey({ type: lowerCase(characterType), data: { tabletopCharacterId: typedProps.data.tabletopCharacterId } })
			return {
				queryKey,
				characterType
			}
		}
		case 'tiles-map': return [campaignId, 'tabletop', 'tiles', 'map'] as const
		case 'round': return [campaignId, 'tabletop', 'round'] as const
		case 'tiles-character': return [campaignId, 'tabletop', 'tiles', 'characters'] as const
		case 'encounter-name': return [campaignId, 'tabletop', 'encounter-name'] as const
		case 'encounter-list': return [campaignId, 'tabletop', 'encounter-list'] as const
	}
}
