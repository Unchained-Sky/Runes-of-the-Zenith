import { createHash } from 'node:crypto'
import { skillVersion } from '~/scripts/data/skills/skillData'
import { getServiceClient } from '~/supabase/getServiceClient'

const supabase = getServiceClient()

{
	const { data, error } = await supabase
		.from('skill_info')
		.delete()
		.eq('version', skillVersion)
	if (error) {
		throw new Error(error.message, { cause: error })
	} else {
		console.log('Rows deleted:', data)
	}
}

{
	// map ts skill data to sql format

	const [userId, campaignId] = ['', '']
	const idHash = createHash('md5').update(`${userId}_${campaignId}`).digest('hex')

	const { data, error } = await supabase
		.from('skill_info')
		.insert([
			{ skill_id: 0, version: skillVersion, skill_data: {} }
		])
}
