export type CompendiumSource = 'Base'

export type Compendium = {
	source: CompendiumSource
}

export const createCompendiumHash = (combatMap: Compendium & { name: string }) => `${combatMap.source}-${combatMap.name}`.toLowerCase()
