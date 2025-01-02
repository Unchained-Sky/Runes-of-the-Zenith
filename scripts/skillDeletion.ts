import { createHash } from 'node:crypto'
import { skillData, skillVersion } from '~/scripts/data/skills/skillData'
import { getServiceClient } from '~/supabase/getServiceClient'

const supabase = getServiceClient()

{
	const { error } = await supabase
		.from('skill_info')
		.delete()
		.eq('version', skillVersion)
	if (error) throw new Error(error.message, { cause: error })
	console.log('Successfully deleted skill_info table data')
}

{
	// map ts skill data to sql format

	const { error } = await supabase
		.from('skill_info')
		.insert(
			skillData.map(data => {
				const skillIdHash = createHash('md5')
					.update(`${data.skillId}-${data.nodeId}`)
					.digest('hex')

				return {
					hash: skillIdHash,
					skill_data: {},
					skill_id: data.skillId,
					version: skillVersion
				}
			})
		)

	if (error) throw new Error(error.message, { cause: error })
	console.log('Successfully inserted updated skill_info table data')
}
