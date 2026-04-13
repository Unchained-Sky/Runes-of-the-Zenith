import { Button, Group, Stack, Title } from '@mantine/core'
import { useTabletopEnemyList } from '~/tt/-hooks/tabletopData/useTabletopEnemyList'
import { useTabletopHeroList } from '~/tt/-hooks/tabletopData/useTabletopHeroList'
import { useWindowsStore } from '~/tt/-windows/useWindowsStore'
import { typedObject } from '~/types/typedObject'

export default function WindowTab() {
	const windows = useWindowsStore(state => state.opened)
	const toggleWindow = useWindowsStore(state => state.toggleWindow)

	return (
		<Stack>
			<Title order={3}>Windows</Title>

			<AddCharacterWindows />

			{typedObject.entries(windows).map(([windowName, opened]) => {
				return (
					<Group key={windowName}>
						<Title order={4}>{windowName}</Title>
						<Button
							size='compact-md'
							onClick={() => toggleWindow(windowName)}
							color={opened ? 'red' : 'green'}
						>
							{opened ? 'Close' : 'Open'}
						</Button>
					</Group>
				)
			})}
		</Stack>
	)
}

function AddCharacterWindows() {
	const { data: heroList } = useTabletopHeroList()
	const { data: enemyList } = useTabletopEnemyList()

	const addCharacter = useWindowsStore(state => state.addCharacter)

	const handleClick = () => {
		heroList.forEach(hero => {
			if (!hero.tabletopCharacterId) return
			addCharacter('HERO', hero.tabletopCharacterId)
		})
		enemyList.forEach(enemy => {
			addCharacter('ENEMY', enemy)
		})
	}

	return <Button onClick={handleClick}>Add Characters</Button>
}
