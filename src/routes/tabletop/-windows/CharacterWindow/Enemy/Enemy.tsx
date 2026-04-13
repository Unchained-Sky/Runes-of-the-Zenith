import { Stack, Title } from '@mantine/core'
import CharacterTokens from '~/tt/-windows/CharacterWindow/CharacterTokens'
import { useEnemyWindowContext } from './EnemyWindowContext'

export default function Enemy() {
	const enemyData = useEnemyWindowContext()

	return (
		<Stack>
			<Title order={3}>{enemyData.enemyName}</Title>

			<CharacterTokens tabletopCharacterId={enemyData.tabletopCharacterId} tokens={enemyData.tokens} characterType='ENEMY' />
		</Stack>
	)
}
