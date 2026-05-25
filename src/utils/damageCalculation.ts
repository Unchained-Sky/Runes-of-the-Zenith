import { type AtLeastOne } from '~/types/atLeastOne'
import { normalDistributionSkew, roundToPrecision } from './maths'

type DamageCalculationData = {
	attackerStats: {
		int: number
		dex: number
		str: number
		critChance: number
	}
	defenderStats: {
		intDef: number
		dexDef: number
		strDef: number
	}
	attack: {
		damageType: AtLeastOne<{
			int: [flat: number, scale: number]
			dex: [flat: number, scale: number]
			str: [flat: number, scale: number]
		}>
		accuracy: number
	}
}

type DamageType = 'int' | 'dex' | 'str'

const getDamageAmount = (data: DamageCalculationData, type: DamageType) => data.attack.damageType[type]
	? data.attack.damageType[type][0] + (data.attack.damageType[type][1] * data.attackerStats[type] / 100)
	: 0

export function damageCalculation(data: DamageCalculationData) {
	const intDamage = getDamageAmount(data, 'int')
	const dexDamage = getDamageAmount(data, 'dex')
	const strDamage = getDamageAmount(data, 'str')

	const critChance = data.attackerStats.critChance % 100
	const critLevel = ~~(data.attackerStats.critChance / 100) + 1
	const didCrit = ~~(Math.random() * 100) < critChance
	const critMultiplier = didCrit ? 1 + (critLevel * 0.5) : 1

	const maxUnmitigatedHit = (intDamage + dexDamage + strDamage) * critMultiplier

	const intDef = data.attack.damageType.int ? data.defenderStats.intDef * (intDamage / maxUnmitigatedHit) : 0
	const dexDef = data.attack.damageType.dex ? data.defenderStats.dexDef * (dexDamage / maxUnmitigatedHit) : 0
	const strDef = data.attack.damageType.str ? data.defenderStats.strDef * (strDamage / maxUnmitigatedHit) : 0
	const totalDefence = roundToPrecision(intDef + dexDef + strDef)

	const maxHit = (150 * maxUnmitigatedHit) / (150 + totalDefence)

	const accuracySkew = (data.attack.accuracy - 105) / -52

	return normalDistributionSkew(0, maxHit, accuracySkew)
}
