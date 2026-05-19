import { useGMTabletopEnemies } from '../../$campaignId.gm/-hooks/tabletopData/useGMTabletopEnemies'
import { usePlayerTabletopEnemies } from '../../$campaignId.player/-hooks/tabletopData/usePlayerTabletopEnemies'
import { useTabletopContext } from '../../-utils/TabletopContext'

export function useTabletopEnemies() {
	const { role } = useTabletopContext()
	return role === 'gm' ? useGMTabletopEnemies() : usePlayerTabletopEnemies()
}
