import { createContext, useContext } from 'react'
import { type TabletopHeroData } from '~/routes/tabletop/$campaignId.gm/-hooks/tabletopData/useTabletopHeroes'

export const HeroWindowContext = createContext<TabletopHeroData | null>(null)

export const useHeroWindowContext = () => {
	const heroData = useContext(HeroWindowContext)
	if (!heroData) throw new Error('Hero Window Context not found')
	return heroData
}
