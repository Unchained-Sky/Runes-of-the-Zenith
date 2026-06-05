import { useContext } from 'react'
import { EnemyWindowContext } from './Enemy/EnemyWindowContext'
import { HeroWindowContext } from './Hero/HeroWindowContext'

export default function useCharacterWindowContext() {
	const heroData = useContext(HeroWindowContext)
	const enemyData = useContext(EnemyWindowContext)

	if (heroData) return {
		...heroData,
		characterType: 'HERO' as const
	}
	if (enemyData) return {
		...enemyData,
		characterType: 'ENEMY' as const
	}

	throw new Error('Character Window Context not found')
}
