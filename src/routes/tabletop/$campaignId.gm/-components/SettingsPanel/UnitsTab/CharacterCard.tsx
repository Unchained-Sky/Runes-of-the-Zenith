import { ActionIcon, Avatar, Card, Group, Menu, Stack, Text } from '@mantine/core'
import { IconPencil, IconTrash, IconX } from '@tabler/icons-react'
import { type Enums } from '~/supabase/databaseTypes'

type CharacterCardProps = {
	character: {
		type: Enums<'character_type'>
		tabletopCharacterId: number
		characterName: string
		stats: {
			maxHealth: number
			maxShield: number
			int: number
			str: number
			dex: number
			maxMovement: number
			critChance: number
		}
		tabletopStats: {
			health: number
			wounds: number
			shield: number
			trauma: number
			movement: number
		}
	}
	removeCharacter?: () => void
}

export default function CharacterCard({
	character: { type, tabletopCharacterId, characterName, stats, tabletopStats },
	removeCharacter
}: CharacterCardProps) {
	return (
		<Card key={tabletopCharacterId} component={Stack} gap={2} align='center' p='sm' bg='dark.5'>
			<Avatar name={characterName} color='red' />
			<Text>{characterName}</Text>
			<Text>Shield: {tabletopStats.shield} [{tabletopStats.trauma}] / {stats.maxShield}</Text>
			<Text>Health: {tabletopStats.health} [{tabletopStats.wounds}] / {stats.maxHealth}</Text>
			<Text>
				<Text span c='blue'>{stats.int}</Text>
				<Text span> / </Text>
				<Text span c='red'>{stats.str}</Text>
				<Text span> / </Text>
				<Text span c='green'>{stats.dex}</Text>
			</Text>
			<Group gap='xs'>
				<ActionIcon variant='subtle' color='gray'>
					<IconPencil />
				</ActionIcon>
				<Menu>
					<Menu.Target>
						<ActionIcon variant='subtle' color='red'>
							<IconX />
						</ActionIcon>
					</Menu.Target>
					<Menu.Dropdown>
						<Menu.Label>Are you sure?</Menu.Label>
						<Menu.Item
							color='red'
							leftSection={<IconTrash size={14} />}
							onClick={() => removeCharacter?.()}
						>
							Remove {type === 'HERO' ? 'Hero' : 'Enemy'}
						</Menu.Item>
					</Menu.Dropdown>
				</Menu>
			</Group>
		</Card>
	)
}
