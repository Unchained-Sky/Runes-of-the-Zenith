import { type } from 'arktype'
import { type EnemyRune } from '~/scripts/data/enemies/enemyData'
import { type Json } from '../databaseTypes'
import { runeEffectSchema } from './runeExtraData'

const enemyRuneExtraDataSchema = type({
	description: 'string',
	effect: runeEffectSchema.array()
})

export const enemyRuneExtraDataFormatter = (rune: { runeInfo: Omit<EnemyRune, 'data'> & { data: Json } }) => {
	const out = enemyRuneExtraDataSchema(rune.runeInfo.data)
	if (out instanceof type.errors) {
		throw console.error(out.summary)
	} else {
		return {
			...rune.runeInfo,
			effect: out
		}
	}
}

export type EnemyRuneExtraData = typeof enemyRuneExtraDataSchema.infer
