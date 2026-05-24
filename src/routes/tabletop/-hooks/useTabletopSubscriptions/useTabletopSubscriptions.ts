import useTabletopCharactersSubscription from './useTabletopCharactersSubscription'
import useTabletopCharacterTokenSubscription from './useTabletopCharacterTokenSubscription'
import useTabletopEnemySubscription from './useTabletopEnemySubscription'
import useTabletopHeroesSubscription from './useTabletopHeroesSubscription'
import useTabletopHeroTurnSubscription from './useTabletopHeroTurnSubscription'
import useTabletopInfoSubscription from './useTabletopInfoSubscription'
import useTabletopLingeringSubscription from './useTabletopLingeringSubscription'
import useTabletopTilesSubscription from './useTabletopTilesSubscription'

export const LOG_SUBSCRIPTION_PAYLOADS = process.env.NODE_ENV === 'development'

export default function TabletopSubscriptions() {
	useTabletopCharacterTokenSubscription()
	useTabletopCharactersSubscription()
	useTabletopEnemySubscription()
	useTabletopHeroTurnSubscription()
	useTabletopHeroesSubscription()
	useTabletopInfoSubscription()
	useTabletopLingeringSubscription()
	useTabletopTilesSubscription()

	return null
}
