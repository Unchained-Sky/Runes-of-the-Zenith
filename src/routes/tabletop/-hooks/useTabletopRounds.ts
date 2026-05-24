import { useTabletopEnemies } from './tabletopData/useTabletopEnemies'
import { useTabletopHeroes } from './tabletopData/useTabletopHeroes'

function useHeroRounds() {
	const { data: heroesData } = useTabletopHeroes()
	const heroRounds = Object.values(heroesData).flatMap(heroData => {
		return [
			{ tabletopCharacterId: heroData.tabletopCharacterId, ...heroData.turn.PRIMARY },
			{ tabletopCharacterId: heroData.tabletopCharacterId, ...heroData.turn.SECONDARY }
		]
	})
	const usedTurns = heroRounds
		.flatMap(heroRound => heroRound.order ? heroRound : [])
		.sort((a, b) => a.order - b.order)
	const unusedTurnCount = heroRounds.length - usedTurns.length

	return {
		heroRounds,
		usedTurns,
		unusedTurnCount
	}
}

function useEnemyRounds() {
	const { data: enemiesData } = useTabletopEnemies()

	return Object.values(enemiesData).reduce<Record<number, number[]>>((prev, enemyData) => {
		const { currentAggression } = enemyData.tabletopStats
		return {
			...prev,
			[currentAggression]: prev[currentAggression] ? [...prev[currentAggression], enemyData.tabletopCharacterId] : [enemyData.tabletopCharacterId]
		}
	}, {})
}

export function useTabletopRounds() {
	const hero = useHeroRounds()
	const enemies = useEnemyRounds()

	return {
		hero,
		enemies
	}
}
