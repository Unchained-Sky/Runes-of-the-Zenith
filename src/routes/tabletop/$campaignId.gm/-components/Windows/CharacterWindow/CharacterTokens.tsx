import { ActionIcon, Autocomplete, Box, Button, Card, Group, Image, Modal, NumberInput, Pill, Stack, Text, ThemeIcon, Title, Tooltip } from '@mantine/core'
import { useForm } from '@mantine/form'
import { useDisclosure, useListState, type UseListStateHandlers } from '@mantine/hooks'
import { IconPencil, IconPlus } from '@tabler/icons-react'
import { useMutation } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { type } from 'arktype'
import { useMemo, useState } from 'react'
import { useTokenQuery } from '~/hooks/data/useTokenQuery'
import { type TabletopHeroData } from '~/routes/tabletop/$campaignId.gm/-hooks/tabletopData/useTabletopHeroes'
import { type Enums, type TablesInsert } from '~/supabase/databaseTypes'
import { getServiceClient } from '~/supabase/getServiceClient'
import { requireGM } from '~/supabase/requireGM'
import { int2 } from '~/utils/int'
import { mutationError } from '~/utils/mutationError'
import { useQuerySync } from '../../../-hooks/useQuerySync'

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

type TokenIconProps = {
	token: TabletopHeroData['tokens'][number]
}

const getTokenColour = (alignment: Enums<'token_alignment'>) => {
	switch (alignment) {
		case 'POSITIVE':
			return 'green'
		case 'NEUTRAL':
			return 'yellow'
		case 'NEGATIVE':
			return 'red'
	}
}

function TokenIcon({ token }: TokenIconProps) {
	const tokensData = useTokenQuery()

	const tokenData = tokensData[token.name]
	if (!tokenData) throw new Error(`Token ${token.name} not found`)

	return (
		<Tooltip
			key={tokenData.name}
			label={(
				<Box>
					<Text fw='bold'>{tokenData.name}</Text>
					<Text>{tokenData.extraData.description}</Text>
				</Box>
			)}
		>
			<Box pos='relative' id={`token-${token.name}`}>
				<ThemeIcon
					variant='light'
					color={getTokenColour(tokenData.alignment)}
					size='xl'
				>
					<Image src={`/tokenIcon/${tokenData.extraData.image}`} />
				</ThemeIcon>
				<Pill pos='absolute' bottom={0} right={-4}>{token.amount}</Pill>
			</Box>
		</Tooltip>
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
	const { queryClient, campaignId } = useQuerySync()

	const form = useForm({
		mode: 'uncontrolled',
		initialValues: {
			tokens: Object.fromEntries(tokens.map(token => [token.name, token.amount]))
		}
	})

	const updateHeroToken = useMutation({
		mutationFn: updateHeroTokenAction,
		onMutate: ({ data }) => {
			const queryKey = [campaignId, 'tabletop', characterType.toLowerCase(), data.tabletopCharacterId]

			void queryClient.cancelQueries({ queryKey })
			queryClient.setQueriesData({ queryKey }, (oldData: TabletopHeroData) => {
				return {
					...oldData,
					tokens: Object.entries(data.tokens).filter(([_name, amount]) => amount !== 0).map(([name, amount]) => ({ name, amount }))
				} satisfies TabletopHeroData
			})
		},
		onError: error => {
			mutationError(error, 'Failed to update hero tokens')
		}
	})

	const handleSubmit = (values: typeof form.values) => {
		updateHeroToken.mutate({ data: { tabletopCharacterId, tokens: values.tokens } })
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
						<Button flex={1} type='submit'>Update</Button>
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

const updateHeroTokenSchema = type({
	tabletopCharacterId: 'number',
	tokens: {
		'[string]': 'number'
	}
})

const updateHeroTokenAction = createServerFn({ method: 'POST' })
	.inputValidator(updateHeroTokenSchema)
	.handler(async ({ data: { tabletopCharacterId, tokens } }) => {
		await requireGM({ tabletopCharacterId })

		const { upsert: upsertTokens, delete: deleteTokens } = Object.entries(tokens).reduce<{
			upsert: { name: string, amount: number }[]
			delete: string[]
		}>((acc, [name, amount]) => {
			if (amount > int2.ceil || amount < 0) throw new Error(`Amount must be between 0 and ${int2.ceil}`)
			return {
				upsert: amount > 0 ? [...acc.upsert, { name, amount }] : acc.upsert,
				delete: amount === 0 ? [...acc.delete, name] : acc.delete
			}
		}, {
			upsert: [],
			delete: []
		})

		const serviceClient = getServiceClient()

		{
			const { error } = await serviceClient
				.from('tabletop_character_token')
				.upsert(upsertTokens.map(token => ({
					tt_character_id: tabletopCharacterId,
					token_name: token.name,
					amount: token.amount
				} satisfies TablesInsert<'tabletop_character_token'>)))
			if (error) throw new Error(error.message, { cause: error })
		}

		{
			const { error } = await serviceClient
				.from('tabletop_character_token')
				.delete()
				.eq('tt_character_id', tabletopCharacterId)
				.in('token_name', deleteTokens)
			if (error) throw new Error(error.message, { cause: error })
		}
	})
