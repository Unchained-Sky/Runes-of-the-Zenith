import { Group, Stack, Text } from '@mantine/core'
import { type EnemyRuneData } from '~/scripts/data/enemies/enemyData'
import { CharacterRune, RuneCard } from '../CharacterRunes'
import { useEnemyWindowContext } from './EnemyWindowContext'

export default function EnemyRunes() {
	const enemyData = useEnemyWindowContext()

	return (
		<Stack>
			<RuneCard title='PRIMARY'>
				<Runes runes={enemyData.runes.PRIMARY} />
			</RuneCard>
			<RuneCard title='SECONDARY'>
				<Runes runes={enemyData.runes.SECONDARY} />
			</RuneCard>
			<RuneCard title='PASSIVE'>
				<Runes runes={enemyData.runes.PASSIVE} />
			</RuneCard>
		</Stack>
	)
}

type RunesProps = {
	runes: EnemyRuneData[]
}

function Runes({ runes }: RunesProps) {
	return runes.length
		? runes.map(runeData => {
			return (
				<CharacterRune
					key={runeData.name}
					runeData={runeData}
					inlineDescription={(
						<Group flex={1} justify='space-between'>
							<Text>{runeData.name}</Text>
							<Stack gap={0}>
								<Text ta='right' size='sm'>{runeData.durability}</Text>
								<Text ta='right' size='xs'>{runeData.damageType}</Text>
							</Stack>
						</Group>
					)}
				/>
			)
		})
		: <Text fs='italic'>None</Text>
}
