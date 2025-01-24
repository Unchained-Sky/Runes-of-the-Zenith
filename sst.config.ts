import { type SSTConfig } from 'sst'
import { RemixSite } from 'sst/constructs'
import { getSupabaseEnv } from '~/supabase/supabaseEnv'

const { SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE } = getSupabaseEnv()

export default {
	config(input) {
		return {
			name: 'runes-of-the-zenith',
			region: 'eu-west-2',
			profile: input.stage === 'production' ? 'rotz-prod' : 'rotz-dev'
		}
	},
	stacks(app) {
		app.stack(function Site({ stack }) {
			const site = new RemixSite(stack, 'site', {
				environment: {
					SUPABASE_URL,
					SUPABASE_ANON_KEY,
					SUPABASE_SERVICE_ROLE
				}
			})
			stack.addOutputs({
				url: site.url
			})
		})
	}
} satisfies SSTConfig
