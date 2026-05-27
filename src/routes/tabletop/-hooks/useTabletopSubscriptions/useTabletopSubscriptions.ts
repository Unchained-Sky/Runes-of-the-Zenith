import { type Database } from '~/supabase/databaseTypes'
import useTabletopCharactersSubscription from './useTabletopCharactersSubscription'
import useTabletopCharacterTokenSubscription from './useTabletopCharacterTokenSubscription'
import useTabletopEnemySubscription from './useTabletopEnemySubscription'
import useTabletopHeroesSubscription from './useTabletopHeroesSubscription'
import useTabletopHeroTurnSubscription from './useTabletopHeroTurnSubscription'
import useTabletopInfoSubscription from './useTabletopInfoSubscription'
import useTabletopLingeringSubscription from './useTabletopLingeringSubscription'
import useTabletopTilesSubscription from './useTabletopTilesSubscription'

export const LOG_SUBSCRIPTION_PAYLOADS = process.env.NODE_ENV === 'development'
export const LOG_SUBSCRIPTION_STATUS = process.env.NODE_ENV === 'development'

export type TabletopSubscriptionProps = {
	channelName: string
	table: keyof Database['public']['Tables']
}

export default function useTabletopSubscriptions(campaignId: number) {
	function getChannelName(table: keyof Database['public']['Tables']) {
		return {
			table,
			channelName: `${table}:${campaignId}`
		}
	}

	useTabletopCharacterTokenSubscription(getChannelName('tabletop_character_token'))
	useTabletopCharactersSubscription(getChannelName('tabletop_characters'))
	useTabletopEnemySubscription(getChannelName('tabletop_enemy'))
	useTabletopHeroTurnSubscription(getChannelName('tabletop_hero_turn'))
	useTabletopHeroesSubscription(getChannelName('tabletop_heroes'))
	useTabletopInfoSubscription(getChannelName('tabletop_info'))
	useTabletopLingeringSubscription(getChannelName('tabletop_lingering'))
	useTabletopTilesSubscription(getChannelName('tabletop_tiles'))
}
