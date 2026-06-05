import { type } from 'arktype'
import { type EnemyRuneData } from '~/scripts/data/enemies/enemyData'
import { type Json } from '../databaseTypes'
import { runeEffectSchema } from './runeExtraData'

const enemyRuneExtraDataSchema = type({
	description: 'string',
	effect: runeEffectSchema.array()
})

export const enemyRuneExtraDataFormatter = (rune: Omit<EnemyRuneData, 'data'> & { data: Json }) => {
	const out = enemyRuneExtraDataSchema(rune.data)
	if (out instanceof type.errors) {
		throw console.error(out.summary)
	} else {
		return {
			...rune,
			effect: out
		}
	}
}

export type EnemyRuneExtraData = typeof enemyRuneExtraDataSchema.infer
