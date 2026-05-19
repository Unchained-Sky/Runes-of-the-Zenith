import useTabletopCharacterTokenSubscription from './useTabletopCharacterTokenSubscription'

export const LOG_SUBSCRIPTION_PAYLOADS = process.env.NODE_ENV === 'development'

export default function TabletopSubscriptions() {
	useTabletopCharacterTokenSubscription()

	return null
}
