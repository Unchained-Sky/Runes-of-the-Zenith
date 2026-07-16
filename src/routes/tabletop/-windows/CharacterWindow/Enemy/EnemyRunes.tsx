import { Group, Stack, Text } from '@mantine/core'
import { type TabletopEnemyRuneData } from '~/routes/tabletop/$campaignId.gm/-hooks/tabletopData/useGMTabletopEnemies'
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
	runes: TabletopEnemyRuneData[]
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
								{runeData.currentDurability
									? (
										<Text ta='right' size='sm'>
											{`${runeData.currentDurability} `}
											<Text span c='dimmed'>{runeData.durability}</Text>
										</Text>
									)
									: <Text ta='right' size='sm'>{runeData.durability}</Text>}
								<Text ta='right' size='xs'>{runeData.damageType}</Text>
							</Stack>
						</Group>
					)}
				/>
			)
		})
		: <Text fs='italic'>None</Text>
}
