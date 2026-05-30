import { type } from 'arktype'
import { type Enums, type Json } from '../databaseTypes'

export const lingeringExtraData = type({
	description: 'string'
})

export const lingeringDataFormatter = (lingering: {
	lingeringId: number
	decrementTime: Enums<'decrement_time'>
	remainingTime: number
	data: Json
}) => {
	const out = lingeringExtraData(lingering.data)
	if (out instanceof type.errors) {
		throw console.error(out.summary)
	} else {
		return {
			...lingering,
			data: out
		}
	}
}
