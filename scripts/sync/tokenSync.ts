import { type TablesInsert } from '~/supabase/databaseTypes'
import { getServiceClient } from '~/supabase/getServiceClient'
import tokens from '../data/tokens/tokens'

const supabase = getServiceClient()

{
	const tokensSet = new Set(tokens.map(token => token.name))
	if (tokens.length !== tokensSet.size) throw new Error('Duplicate token names')
}

{
	const { error } = await supabase
		.from('token_info')
		.delete()
		// Supabase doesn't allow delete with a WHERE clause
		.neq('name', '')
	if (error) throw new Error(error.message, { cause: error })
}

{
	const { error } = await supabase
		.from('token_info')
		.insert(
			tokens.map<TablesInsert<'token_info'>>(token => ({
				name: token.name,
				alignment: token.alignment,
				extraData: { ...token.extraData }
			}))
		)
	if (error) throw new Error(error.message, { cause: error })
}

console.log(`Synced ${tokens.length} tokens`)
