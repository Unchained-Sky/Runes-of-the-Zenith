import { createHash } from 'node:crypto'
import { type TablesInsert } from '~/supabase/databaseTypes'
import { getServiceClient } from '~/supabase/getServiceClient'
import { skillData, skillVersion } from './data/skills/skillData'

const supabase = getServiceClient()
const version = skillVersion

{
	const { error } = await supabase
		.from('skill_links')
		.delete()
		.eq('version', version)
	if (error) throw new Error(error.message, { cause: error })
	console.log('Successfully deleted skill_links table data')
}

{
	const { error } = await supabase
		.from('skill_info')
		.delete()
		.eq('version', version)
	if (error) throw new Error(error.message, { cause: error })
	console.log('Successfully deleted skill_info table data')
}

{
	const { error } = await supabase
		.from('skill_info')
		.insert(
			skillData.map(data => {
				const hash = createHash('md5')
					.update(`${data.skillId}-${version}`)
					.digest('hex')

				return {
					hash,
					skill_id: data.skillId,
					skill_data: {},
					version
				} satisfies TablesInsert<'skill_info'>
			})
		)

	if (error) throw new Error(error.message, { cause: error })
	console.log('Successfully inserted updated skill_info table data')
}

{
	const { error } = await supabase
		.from('skill_links')
		.insert(
			skillData.map(data => {
				return data.childNodes.map(childNodeId => {
					const hash = createHash('md5')
						.update(`${data.skillId}-${childNodeId}-${version}`)
						.digest('hex')

					return {
						hash,
						skill_id: data.skillId,
						next_skill_id: childNodeId,
						version
					} satisfies TablesInsert<'skill_links'>
				})
			}).flat(1)
		)
	if (error) throw new Error(error.message, { cause: error })
	console.log('Successfully inserted updated skill_links table data')
}
