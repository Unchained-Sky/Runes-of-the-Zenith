import { type CombatMap } from '~/types/gameTypes/combatMap'
import one from './combatMapTemplates/one'
import three from './combatMapTemplates/three'
import two from './combatMapTemplates/two'

type CombatMapTemplateName = typeof combatTemplateList[number]['name']

export type CombatMapTemplate = CombatMap<CombatMapTemplateName>

const combatTemplateList = [
	one,
	two,
	three
] as const satisfies CombatMap[]

const combatTemplates = new Map<CombatMapTemplateName, CombatMapTemplate>([
	...combatTemplateList.map<[CombatMapTemplateName, CombatMapTemplate]>(template => [template.name, template])
])

export function getCombatMapTemplate(templateName: CombatMapTemplateName) {
	if (!combatTemplates.has(templateName)) throw new Error(`Combat map template not found: ${templateName}`)
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	return combatTemplates.get(templateName) ?? combatTemplates.get('one')!
}

export function getAllCombatMapTemplates() {
	return combatTemplateList
}
