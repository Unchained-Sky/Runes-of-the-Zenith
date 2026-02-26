import { type AtLeastOne } from '~/types/atLeastOne'

type DamageCalculationData = {
	attackerStats: {
		int: number
		dex: number
		str: number
		// TODO include crit chance
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
		// TODO skew accuracy
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
	const maxHit = intDamage + dexDamage + strDamage

	const intDef = data.attack.damageType.int ? data.defenderStats.intDef * (intDamage / maxHit) : 0
	const dexDef = data.attack.damageType.dex ? data.defenderStats.dexDef * (dexDamage / maxHit) : 0
	const strDef = data.attack.damageType.str ? data.defenderStats.strDef * (strDamage / maxHit) : 0
	const totalDefence = roundToPrecision(intDef + dexDef + strDef)

	// TODO add real diminishing returns to defence
	const mean = maxHit - (totalDefence / 1.5)

	return generateGaussianRandom(maxHit, mean)
}

export function generateGaussianRandom(max: number, mean: number, min = 0, stddev = 12) {
	let u = 0, v = 0
	while (u === 0) u = Math.random()
	while (v === 0) v = Math.random()
	const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)
	const out = z * stddev + mean
	if (out < min || out > max) return generateGaussianRandom(max, mean, min, stddev)
	return roundToPrecision(out)
}

const roundToPrecision = (x: number, precision = 1) => {
	const y = +x + (precision / 2)
	return y - (y % precision)
}
