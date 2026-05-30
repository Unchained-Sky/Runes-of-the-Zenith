import { type Enums } from '~/supabase/databaseTypes'

export const lingeringDecrementTime = {
	CUSTOM: 'Custom',
	START_ROUND: 'Round Start',
	END_ROUND: 'Round End',
	START_TURN: 'Turn Start',
	END_TURN: 'Turn End'
} satisfies Record<Enums<'decrement_time'>, string>
