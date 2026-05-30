import { type Enums } from '~/supabase/databaseTypes'
import { type RuneExtraData } from '~/supabase/extraDataFormatter/runeExtraData'
import astral from './intelligence/arcane/astral'

export type RuneDataInternal = {
	name: string
	description: string
	resolve: number
	effect: RuneExtraData['effect']
	slot: Enums<'rune_slot'>
	durability: Enums<'rune_durability'>
}

export type RuneData = {
	name: string
	subarchetype: Enums<'subarchetype'>
	slot: Enums<'rune_slot'>
	durability: Enums<'rune_durability'>
	data: RuneExtraData
}

const allRunes = [
	astral
].flat(1)

export default allRunes
