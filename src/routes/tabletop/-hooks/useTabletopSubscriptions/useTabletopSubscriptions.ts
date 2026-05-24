import useTabletopCharactersSubscription from './useTabletopCharactersSubscription'
import useTabletopCharacterTokenSubscription from './useTabletopCharacterTokenSubscription'
import useTabletopEnemySubscription from './useTabletopEnemySubscription'
import useTabletopHeroTurnSubscription from './useTabletopHeroTurnSubscription'

export const LOG_SUBSCRIPTION_PAYLOADS = process.env.NODE_ENV === 'development'

export default function TabletopSubscriptions() {
	useTabletopCharacterTokenSubscription()
	useTabletopCharactersSubscription()
	useTabletopEnemySubscription()
	useTabletopHeroTurnSubscription()

	return null
}
