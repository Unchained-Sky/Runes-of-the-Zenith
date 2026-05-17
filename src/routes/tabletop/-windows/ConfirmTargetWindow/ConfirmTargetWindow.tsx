import { Window } from '@gfazioli/mantine-window'
import { Button, Group, List, Stack, Text } from '@mantine/core'
import { useAssignNextHeroTurn } from '~/routes/tabletop/-utils/gameActions/assignNextHeroTurn'
import { type Enums } from '~/supabase/databaseTypes'
import { type CombatTileCordString } from '~/types/gameTypes/combatMap'
import { useTabletopEnemies } from '../../-hooks/tabletopData/useTabletopEnemies'
import { useTabletopHeroes } from '../../-hooks/tabletopData/useTabletopHeroes'
import { useConfirmTargetStore } from './useConfirmTargetStore'

export default function ConfirmTargetWindow() {
	const { opened, close, runeData } = useConfirmTargetStore()

	return (
		<Window
			title={`Confirm Action - ${runeData?.name}`}
			id='confirm-target'
			opened={opened}
			onClose={close}
			defaultWidth={360}
			defaultHeight={480}
			draggable='header'
			styles={{
				header: {
					cursor: 'move'
				}
			}}
		>
			<WindowInner />
		</Window>
	)
}

function WindowInner() {
	const { opened, runeData, currentEffectIndex } = useConfirmTargetStore()

	if (!opened) return null

	return (
		<Stack>
			<TargetList />
			<Group>
				{currentEffectIndex === 0 ? <CancelButton /> : <BackButton />}
				{currentEffectIndex < runeData.data.effect.length - 1 ? <NextButton /> : <ConfirmButton />}
			</Group>
		</Stack>
	)
}

function CancelButton() {
	const { close } = useConfirmTargetStore()

	return <Button variant='default' onClick={close}>Cancel</Button>
}

function BackButton() {
	const { backStep } = useConfirmTargetStore()

	return <Button variant='default' onClick={backStep}>Back</Button>
}

function NextButton() {
	const { nextStep } = useConfirmTargetStore()

	return <Button flex={1} color='green' onClick={nextStep}>Next</Button>
}

function ConfirmButton() {
	const { runeData, tabletopCharacterId, tabletopCharacterType, close } = useConfirmTargetStore()

	const assignNextTurn = useAssignNextHeroTurn()

	const confirmTarget = () => {
		if (tabletopCharacterType === 'HERO') {
			if (runeData.slot !== 'PASSIVE') {
				assignNextTurn.mutate({
					data: {
						tabletopCharacterId,
						turnType: runeData.slot
					}
				})
			}

			// CAST RUNE
		}

		close()
	}

	return <Button flex={1} color='green' onClick={confirmTarget}>Confirm</Button>
}

function TargetList() {
	const { runeData, currentEffectIndex, selected } = useConfirmTargetStore()

	if (!runeData) return

	return runeData.data.effect.map(({ target }, index) => {
		const isCurrent = index === currentEffectIndex
		const targetCount = target.amount

		const currentSelected = selected[index]
		const characterCount = currentSelected ? ('characters' in currentSelected ? currentSelected.characters.length : 0) : 0
		const tilesCount = currentSelected ? ('tiles' in currentSelected ? currentSelected.tiles.length : 0) : 0
		const selectedCount = Math.max(characterCount, tilesCount)

		const textCount = Math.max(targetCount, selectedCount)
		return (
			<Stack key={index} gap={0}>
				<Text fw={isCurrent ? 700 : 400}>
					{isCurrent ? '> ' : ''}Target type {target.selectType} {target.characterType} ({target.amount})
				</Text>
				<List>
					{Array.from({ length: textCount }).map((_, i) => {
						const isOver = i >= targetCount

						const characters = currentSelected ? ('characters' in currentSelected ? currentSelected.characters : null) : null
						if (target.selectType === 'CHARACTER') return <CharacterLine key={i} character={characters?.[i]} isOver={isOver} />

						const tiles = currentSelected ? ('tiles' in currentSelected ? currentSelected.tiles : null) : null
						if (target.selectType === 'TILE') return <TilesLine key={i} tile={tiles?.[i]} isOver={isOver} />

						return null
					})}
				</List>
			</Stack>
		)
	})
}

type CharacterLineProps = {
	character?: CharacterLineCharacterProps['character']
	isOver: boolean
}

function CharacterLine({ character, isOver }: CharacterLineProps) {
	return character
		? <CharacterLineCharacter character={character} isOver={isOver} />
		: (
			<List.Item>
				<Text span>________</Text>
			</List.Item>
		)
}

type CharacterLineCharacterProps = {
	character: {
		tabletopCharacterId: number
		characterType: Enums<'character_type'>
	}
	isOver: boolean
}

function CharacterLineCharacter({ character, isOver }: CharacterLineCharacterProps) {
	const { data: heroesData } = useTabletopHeroes()
	const { data: enemiesData } = useTabletopEnemies()

	const { tabletopCharacterId, characterType } = character

	const getName = () => {
		if (characterType === 'HERO') {
			const hero = heroesData[tabletopCharacterId]
			return hero?.heroName ?? ''
		}

		const enemy = enemiesData[tabletopCharacterId]
		return enemy?.enemyName ?? ''
	}

	return (
		<List.Item>
			<Text c={isOver ? 'red' : 'gray'}>{getName()}</Text>
		</List.Item>
	)
}

type TilesLineProps = {
	tile?: CombatTileCordString
	isOver: boolean
}

function TilesLine({ tile, isOver }: TilesLineProps) {
	return (
		<List.Item>
			<Text span c={isOver ? 'red' : 'gray'}>{tile ?? '________'}</Text>
		</List.Item>
	)
}
