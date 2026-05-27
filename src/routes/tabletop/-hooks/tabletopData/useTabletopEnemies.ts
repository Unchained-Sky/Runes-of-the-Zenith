import { useGMTabletopEnemies } from '../../$campaignId.gm/-hooks/tabletopData/useGMTabletopEnemies'
import { usePlayerTabletopEnemies } from '../../$campaignId.player/-hooks/tabletopData/usePlayerTabletopEnemies'
import { useTabletopEnvironmentStore } from '../useTabletopEnvironmentStore'

export function useTabletopEnemies() {
	const { role } = useTabletopEnvironmentStore()
	return role === 'gm' ? useGMTabletopEnemies() : usePlayerTabletopEnemies()
}
