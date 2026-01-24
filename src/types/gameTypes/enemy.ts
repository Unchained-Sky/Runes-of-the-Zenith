import { type Character } from './character'

export type Enemy = Character & {
	stats: {
		aggression: number
	}
}
