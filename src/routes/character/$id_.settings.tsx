import { Button, rem, Select, Stack, Switch, Text, Title } from '@mantine/core'
import { useForm } from '@mantine/form'
import { useMutation } from '@tanstack/react-query'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { type } from 'arktype'
import { getServiceClient } from '~/supabase/getServiceClient'
import { getUserId } from '~/supabase/getUserId'
import { requireAccount } from '~/supabase/requireAccount'
import { type FormResponse } from '~/types/formResponse'

export const Route = createFileRoute('/character/$id_/settings')({
	component: RouteComponent,
	loader: async ({ params: { id } }) => await serverLoader({ data: { characterId: id } }),
	head: ({ loaderData }) => ({
		meta: loaderData
			? [{ title: `Character: ${loaderData.characterName}` }]
			: undefined
	})
})

const serverLoaderSchema = type({
	characterId: 'string.digits'
})

const serverLoader = createServerFn({ method: 'GET' })
	.validator(serverLoaderSchema)
	.handler(async ({ data: { characterId: CharacterIdString } }) => {
		const characterId = parseInt(CharacterIdString)

		const { supabase } = await requireAccount({ backlink: '/character' })

		const { data: characterData, error: characterError } = await supabase
			.from('character_info')
			.select(`
				character_name,
				campaign_id,
				user_id,
				visibility
			`)
			.eq('character_id', characterId)
			.limit(1)
			.maybeSingle()
		if (characterError) throw new Error(characterError.message, { cause: characterError })
		if (!characterData) throw redirect({ to: '/character' })

		const { character_name, campaign_id, user_id, visibility } = characterData

		const { userId } = await getUserId(supabase)
		if (user_id !== userId) throw redirect({
			to: '/character/$id',
			params: { id: characterId.toString() }
		})

		const { data: campaignData, error: campaignError } = await supabase
			.from('campaign_info')
			.select('campaign_id, campaign_name')
		if (campaignError) throw new Error(campaignError.message, { cause: campaignError })

		return {
			characterName: character_name,
			currentCampaignId: campaign_id,
			campaigns: campaignData,
			visibility
		}
	})

function RouteComponent() {
	const {
		characterName,
		currentCampaignId,
		campaigns,
		visibility
	} = Route.useLoaderData()
	const { id: characterId } = Route.useParams()

	const form = useForm({
		mode: 'uncontrolled',
		initialValues: {
			campaignId: currentCampaignId?.toString() ?? '',
			private: visibility === 'PRIVATE'
		}
	})

	const characterSettings = useMutation({
		mutationFn: characterSettingsAction,
		onSuccess: () => {
			form.resetDirty()
			form.resetTouched()
		}
	})

	return (
		<Stack>
			<Title>{characterName}</Title>

			<form onSubmit={form.onSubmit(() => characterSettings.mutate({ data: { characterId, ...form.values } }))}>
				<Stack maw={rem(240)}>
					<Select
						label='Linked Campaign'
						data={campaigns.map(({ campaign_id, campaign_name }) => ({
							value: campaign_id.toString(),
							label: campaign_name
						}))}
						defaultValue={currentCampaignId?.toString()}
						key={form.key('campaignId')}
						{...form.getInputProps('campaignId')}
					/>

					<Switch
						defaultChecked={visibility === 'PRIVATE'}
						label='Private'
						description='Private characters can still be viewed to members of the same campaign'
						key={form.key('private')}
						{...form.getInputProps('private', { type: 'checkbox' })}
					/>

					<Button
						type='submit'
						loading={form.submitting}
						disabled={!form.isDirty()}
					>
						Save
					</Button>

					{characterSettings.data && !form.isTouched()
						? (
							<Text c={characterSettings.data.error ? 'red' : 'green'}>
								{characterSettings.data.message}
							</Text>
						)
						: null}
				</Stack>
			</form>
		</Stack>
	)
}

const characterSettingsSchema = type({
	characterId: 'string.digits',
	campaignId: 'string.digits | null',
	private: 'boolean'
})

const characterSettingsAction = createServerFn({ method: 'POST' })
	.validator(characterSettingsSchema)
	.handler(async ({ data }) => {
		const { supabase } = await requireAccount({ backlink: '/character' })

		const characterId = parseInt(data.characterId)

		const { data: characterUserId, error: characterUserIdError } = await supabase
			.from('character_info')
			.select('user_id')
			.eq('character_id', characterId)
			.limit(1)
			.single()
		if (characterUserIdError) return {
			error: true,
			message: characterUserIdError.message
		} satisfies FormResponse

		const { userId } = (await getUserId(supabase))
		if (characterUserId.user_id !== userId) return {
			error: true,
			message: 'You do not own this character'
		} satisfies FormResponse

		const serviceClient = getServiceClient()
		const { error: characterUpdateError } = await serviceClient
			.from('character_info')
			.update({
				campaign_id: data.campaignId ? parseInt(data.campaignId) : null,
				visibility: data.private ? 'PRIVATE' : 'PUBLIC'
			})
			.eq('character_id', characterId)
			.eq('user_id', userId)
		if (characterUpdateError) return {
			error: true,
			message: characterUpdateError.message
		} satisfies FormResponse

		return {
			error: false,
			message: 'Character settings updated'
		} satisfies FormResponse
	})
