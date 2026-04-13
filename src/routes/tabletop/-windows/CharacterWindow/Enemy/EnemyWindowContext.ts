import { createContext, useContext } from 'react'
import { type TabletopEnemyData } from '~/routes/tabletop/$campaignId.gm/-hooks/tabletopData/useTabletopEnemies'

export const EnemyWindowContext = createContext<TabletopEnemyData | null>(null)

export const useEnemyWindowContext = () => {
	const enemyData = useContext(EnemyWindowContext)
	if (!enemyData) throw new Error('Enemy Window Context not found')
	return enemyData
}
