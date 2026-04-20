import { ActionIcon, Autocomplete, Button, Card, Group, Modal, NumberInput, Stack, Text, Title } from '@mantine/core'
import { useForm } from '@mantine/form'
import { useDisclosure, useListState, type UseListStateHandlers } from '@mantine/hooks'
import { IconPencil, IconPlus } from '@tabler/icons-react'
import { useMemo, useState } from 'react'
import TokenIcon from '~/components/TokenIcon'
import { useTokenQuery } from '~/hooks/data/useTokenQuery'
import { type TabletopHeroData } from '~/routes/tabletop/-hooks/tabletopData/useTabletopHeroes'
import { type Enums } from '~/supabase/databaseTypes'
import { int2 } from '~/utils/int'
import { useUpdateCharacterTokens } from '../../-utils/gameActions/updateCharacterTokens'

type TokenProps = {
	tabletopCharacterId: number
	tokens: TabletopHeroData['tokens']
	characterType: Enums<'character_type'>
}

export default function CharacterTokens({ tabletopCharacterId, tokens, characterType }: TokenProps) {
	const [opened, { open, close }] = useDisclosure(false)

	return (
		<>
			<Card component={Stack} bg='dark.5'>
				<Title order={4}>Tokens</Title>
				<Group>
					{tokens.map(token => {
						return <TokenIcon key={token.name} token={token} />
					})}

					{tokens.length === 0 && <Text fs='italic'>None</Text>}

					<ActionIcon variant='transparent' onClick={open}>
						<IconPencil />
					</ActionIcon>
				</Group>
			</Card>

			<TokenEditModal
				opened={opened}
				close={close}
				tabletopCharacterId={tabletopCharacterId}
				tokens={tokens}
				characterType={characterType}
			/>
		</>
	)
}

type TokenEditModalProps = {
	opened: boolean
	close: () => void
	tabletopCharacterId: number
	tokens: TabletopHeroData['tokens']
	characterType: Enums<'character_type'>
}

function TokenEditModal({ opened, tabletopCharacterId, close, tokens, characterType }: TokenEditModalProps) {
	const form = useForm({
		mode: 'uncontrolled',
		initialValues: {
			tokens: Object.fromEntries(tokens.map(token => [token.name, token.amount]))
		}
	})

	const updateHeroToken = useUpdateCharacterTokens()

	const handleSubmit = (values: typeof form.values) => {
		updateHeroToken.mutate({ data: { tabletopCharacterId, characterType, tokens: values.tokens } })
		close()
		form.setInitialValues(values)
	}

	const [virtualTokens, virtualTokensHandlers] = useListState(tokens)
	const virtualTokenList = virtualTokens.map(token => token.name)

	return (
		<Modal
			opened={opened}
			onClose={close}
			onExitTransitionEnd={form.reset}
			title='Edit tokens'
		>
			<form onSubmit={form.onSubmit(handleSubmit)}>
				<Stack gap='xl'>
					<Stack gap='sm'>
						{virtualTokens.map(token => {
							return (
								<Group key={token.name} align='flex-end'>
									<TokenIcon token={token} />
									<NumberInput
										min={0}
										max={int2.ceil}
										label={token.name}
										{...form.getInputProps(`tokens.${token.name}`)}
									/>
								</Group>
							)
						})}
					</Stack>

					<AddToken virtualTokenList={virtualTokenList} virtualTokensHandlers={virtualTokensHandlers} />

					<Group>
						<Button variant='default' onClick={close}>Cancel</Button>
						<Button flex={1} color='green' type='submit'>Update</Button>
					</Group>
				</Stack>
			</form>
		</Modal>
	)
}

type AddTokenProps = {
	virtualTokenList: string[]
	virtualTokensHandlers: UseListStateHandlers<{ name: string, amount: number }>
}

function AddToken({ virtualTokenList, virtualTokensHandlers }: AddTokenProps) {
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
				disabled: virtualTokenList.includes(tokenData.name)
			})
		}

		return [
			{ group: 'Positive', items: out.POSITIVE },
			{ group: 'Neutral', items: out.NEUTRAL },
			{ group: 'Negative', items: out.NEGATIVE }
		]
	}, [tokensData, virtualTokenList])

	const [addTokenText, setAddTokenText] = useState('')

	return (
		<Group align='flex-end'>
			<Autocomplete
				clearable
				label='Add token'
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
			<ActionIcon
				size={36}
				disabled={!tokenName.includes(addTokenText)}
				onClick={() => {
					virtualTokensHandlers.append({ name: addTokenText, amount: 0 })
					setAddTokenText('')
				}}
			>
				<IconPlus />
			</ActionIcon>
		</Group>
	)
}
