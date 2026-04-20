import { ActionIcon, Autocomplete, Button, Card, Group, NumberInput, Stack, Text, Title, Tooltip } from '@mantine/core'
import { useDisclosure, useMap } from '@mantine/hooks'
import { IconPencil, IconPlus, IconX } from '@tabler/icons-react'
import { useMemo, useState } from 'react'
import TokenIcon from '~/components/TokenIcon'
import { useTokenQuery } from '~/hooks/data/useTokenQuery'
import { useUpdateCharacterTokens } from '~/routes/tabletop/-utils/gameActions/updateCharacterTokens'
import { type Enums } from '~/supabase/databaseTypes'
import { int2 } from '~/utils/int'
import { useHeroWindowContext } from './HeroWindowContext'

export default function HeroTokens() {
	const [isEditing, { toggle, close }] = useDisclosure(false)

	return (
		<Card component={Stack} bg='dark.5'>
			<Group>
				<Title order={4}>Tokens</Title>
				<ActionIcon variant='subtle'>
					<IconPencil onClick={toggle} />
				</ActionIcon>
			</Group>
			{isEditing ? <EditToken close={close} /> : <TokenDisplay />}
		</Card>
	)
}

function TokenDisplay() {
	const { tokens } = useHeroWindowContext()

	return (
		<Group>
			{tokens.map(token => {
				return <TokenIcon key={token.name} token={token} />
			})}
			{tokens.length === 0 && <Text fs='italic'>None</Text>}
		</Group>
	)
}

type EditTokenProps = {
	close: () => void
}

function EditToken({ close }: EditTokenProps) {
	const { tokens, tabletopCharacterId } = useHeroWindowContext()
	const currentTokens = useMemo(() => Object.fromEntries(tokens.map(token => [token.name, token.amount] as const)), [tokens])

	const updateCharacterToken = useUpdateCharacterTokens()

	const virtualTokens = useMap(tokens.map(token => [token.name, token.amount]))

	return (
		<Stack>
			<Stack gap='sm'>
				{Array.from(virtualTokens.entries()).map(([tokenName, tokenAmount]) => {
					return (
						<Group key={tokenName} align='flex-end'>
							<TokenIcon token={{ name: tokenName, amount: currentTokens[tokenName] ?? 0 }} />
							<NumberInput
								min={0}
								max={int2.ceil}
								label={tokenName}
								flex={1}
								defaultValue={tokenAmount}
								onChange={event => virtualTokens.set(tokenName, +event)}
							/>
							<Tooltip label='Remove'>
								<ActionIcon size={36} variant='light' color='red'>
									<IconX onClick={() => virtualTokens.delete(tokenName)} />
								</ActionIcon>
							</Tooltip>
						</Group>
					)
				})}
			</Stack>

			<AddToken virtualTokens={virtualTokens} />

			<Group>
				<Button variant='default' onClick={close}>Cancel</Button>
				<Button
					flex={1}
					type='submit'
					onClick={() => {
						updateCharacterToken.mutate({
							data: {
								tabletopCharacterId,
								characterType: 'HERO',
								tokens: Object.fromEntries(virtualTokens)
							}
						})
						close()
					}}
				>
					Update
				</Button>
			</Group>
		</Stack>
	)
}

type AddTokenProps = {
	virtualTokens: Map<string, number>
}

function AddToken({ virtualTokens }: AddTokenProps) {
	const tokensData = useTokenQuery()

	const tokenName = useMemo(() => Object.keys(tokensData), [tokensData])

	const autocompleteTokenData = useMemo(() => {
		const out: Record<Enums<'token_alignment'>, { value: string, disabled: boolean }[]> = {
			POSITIVE: [],
			NEUTRAL: [],
			NEGATIVE: []
		}

		for (const tokenData of Object.values(tokensData)) {
			out[tokenData.alignment].push({
				value: tokenData.name,
				disabled: !!virtualTokens.get(tokenData.name)
			})
		}

		return [
			{ group: 'Positive', items: out.POSITIVE },
			{ group: 'Neutral', items: out.NEUTRAL },
			{ group: 'Negative', items: out.NEGATIVE }
		]
	}, [tokensData, virtualTokens])

	const [addTokenText, setAddTokenText] = useState('')

	const canAdd = !tokenName.includes(addTokenText)

	return (
		<Group align='flex-end'>
			<Autocomplete
				clearable
				label='Add Token'
				placeholder='Token Name'
				value={addTokenText}
				onChange={setAddTokenText}
				data={autocompleteTokenData}
				comboboxProps={{
					transitionProps: {
						transition: 'pop',
						duration: 150
					}
				}}
				flex={1}
			/>
			<Tooltip label={`Add ${addTokenText}`} disabled={canAdd}>
				<ActionIcon
					size={36}
					disabled={canAdd}
					onClick={() => {
						virtualTokens.set(addTokenText, 1)
						setAddTokenText('')
					}}
				>
					<IconPlus />
				</ActionIcon>
			</Tooltip>
		</Group>
	)
}
