import { createContext, useContext } from 'react'
import { type TabletopGMEnemyData } from '~/routes/tabletop/$campaignId.gm/-hooks/tabletopData/useTabletopEnemies'

export const EnemyWindowContext = createContext<TabletopGMEnemyData | null>(null)

export const useEnemyWindowContext = () => {
	const enemyData = useContext(EnemyWindowContext)
	if (!enemyData) throw new Error('Enemy Window Context not found')
	return enemyData
}
