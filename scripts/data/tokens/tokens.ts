import { type } from 'arktype'
import { type Enums } from '~/supabase/databaseTypes'

export type Token = {
	name: string
	alignment: Enums<'token_alignment'>
	extraData: typeof tokenExtraDataSchema.infer
}

export const tokenExtraDataSchema = type({
	image: 'string',
	description: 'string',
	maxStack: 'number | null'
})

const tokens = [
	{
		name: 'token-1',
		alignment: 'POSITIVE',
		extraData: {
			description: 'Token 1',
			image: 'token.png',
			maxStack: null
		}
	},
	{
		name: 'token-2',
		alignment: 'NEUTRAL',
		extraData: {
			description: 'Token 2',
			image: 'token.png',
			maxStack: 2
		}
	},
	{
		name: 'token-3',
		alignment: 'NEGATIVE',
		extraData: {
			description: 'Token 3',
			image: 'token.png',
			maxStack: null
		}
	},
	{
		name: 'token-4',
		alignment: 'NEGATIVE',
		extraData: {
			description: 'Token 4',
			image: 'token.png',
			maxStack: null
		}
	},
	{
		name: 'token-5',
		alignment: 'NEGATIVE',
		extraData: {
			description: 'Token 5',
			image: 'token.png',
			maxStack: null
		}
	},
	{
		name: 'token-6',
		alignment: 'NEGATIVE',
		extraData: {
			description: 'Token 6',
			image: 'token.png',
			maxStack: null
		}
	}
] satisfies Token[]

export default tokens
