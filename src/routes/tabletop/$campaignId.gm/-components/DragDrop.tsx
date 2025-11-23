import { DragDropProvider } from '@dnd-kit/react'
import { type ReactNode } from 'react'
import { type Tables } from '~/supabase/databaseTypes'
import { type CombatTileCord } from '~/types/gameTypes/combatMap'
import { useMoveCharacter } from '../-utils/moveCharacter'

type DragDropProps = {
	children: ReactNode
}

export default function DragDrop({ children }: DragDropProps) {
	const moveCharacter = useMoveCharacter()

	return (
		<DragDropProvider
			onDragEnd={event => {
				if (event.canceled) return

				const { target, source } = event.operation
				if (!isDroppable(target?.data) || !isDraggable(source?.data)) return

				const { cord } = target.data
				const { tabletopCharacterId, characterType } = source.data

				moveCharacter.mutate({
					data: { cord, tabletopCharacterId, characterType }
				})
			}}
		>
			{children}
		</DragDropProvider>
	)
}

function isDroppable(data?: Record<string, unknown>): data is TileDroppable {
	return !!data?.droppableType
}

function isDraggable(data?: Record<string, unknown>): data is CharacterDraggable {
	return !!data?.draggableType
}

type DroppableType = 'TILE'

export type TileDroppable = {
	droppableType: DroppableType
	cord: CombatTileCord
}

type DraggableType = 'CHARACTER'

export type CharacterDraggable = {
	draggableType: DraggableType
	tabletopCharacterId: number
	characterType: Tables<'tabletop_characters'>['character_type']
}
