import { type QueryClient } from '@tanstack/react-query'
import { createContext, useContext } from 'react'

type TabletopContext = {
	campaignId: number
	queryClient: QueryClient
	role: 'gm' | 'player'
	route: '/tabletop/$campaignId/gm/' | '/tabletop/$campaignId/player/'
}

export const TabletopContext = createContext<TabletopContext | null>(null)

export const useTabletopContext = () => {
	const context = useContext(TabletopContext)
	if (!context) throw new Error('useTabletopContext must be used within a TabletopContextProvider')
	return context
}
