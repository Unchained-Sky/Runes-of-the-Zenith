import { useGMTabletopEnemies } from '../../$campaignId.gm/-hooks/tabletopData/useTabletopEnemies'
import { usePlayerTabletopEnemies } from '../../$campaignId.player/-hooks/tabletopData/useTabletopEnemies'
import { useTabletopContext } from '../../-utils/TabletopContext'

export function useTabletopEnemies() {
	const { role } = useTabletopContext()
	return role === 'gm' ? useGMTabletopEnemies() : usePlayerTabletopEnemies()
}
