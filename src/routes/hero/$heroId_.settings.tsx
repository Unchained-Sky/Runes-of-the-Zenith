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

export const Route = createFileRoute('/hero/$heroId_/settings')({
	component: RouteComponent,
	loader: async ({ params: { heroId } }) => await serverLoader({ data: { heroId: +heroId } }),
	head: ({ loaderData }) => ({
		meta: loaderData
			? [{ title: `Hero: ${loaderData.heroName}` }]
			: undefined
	})
})

const serverLoaderSchema = type({
	heroId: 'number'
})

const serverLoader = createServerFn({ method: 'GET' })
	.validator(serverLoaderSchema)
	.handler(async ({ data: { heroId } }) => {
		const { supabase } = await requireAccount({ backlink: '/hero' })

		const { data: heroData, error: heroError } = await supabase
			.from('hero_info')
			.select(`
				heroName: hero_name,
				currentCampaignId: campaign_id,
				heroUserId: user_id,
				visibility
			`)
			.eq('hero_id', heroId)
			.limit(1)
			.maybeSingle()
		if (heroError) throw new Error(heroError.message, { cause: heroError })
		if (!heroData) throw redirect({ to: '/hero' })

		const { heroName, currentCampaignId, heroUserId, visibility } = heroData

		const { userId } = await getUserId(supabase)
		if (heroUserId !== userId) throw redirect({
			to: '/hero/$heroId',
			params: { heroId: heroId.toString() }
		})

		const { data: campaignData, error: campaignError } = await supabase
			.from('campaign_info')
			.select(`
				campaignId: campaign_id,
				campaignName: campaign_name
			`)
		if (campaignError) throw new Error(campaignError.message, { cause: campaignError })

		return {
			heroName,
			currentCampaignId,
			campaigns: campaignData,
			visibility
		}
	})

function RouteComponent() {
	const {
		heroName,
		currentCampaignId,
		campaigns,
		visibility
	} = Route.useLoaderData()
	const { heroId } = Route.useParams()

	const form = useForm({
		mode: 'uncontrolled',
		initialValues: {
			campaignId: currentCampaignId?.toString() ?? '',
			private: visibility === 'PRIVATE'
		}
	})

	const heroSettings = useMutation({
		mutationFn: heroSettingsAction,
		onSuccess: () => {
			form.resetDirty()
			form.resetTouched()
		}
	})

	return (
		<Stack>
			<Title>{heroName}</Title>

			<form onSubmit={form.onSubmit(() => heroSettings.mutate({ data: { heroId: +heroId, ...form.values } }))}>
				<Stack maw={rem(240)}>
					<Select
						label='Linked Campaign'
						data={campaigns.map(({ campaignId, campaignName }) => ({
							value: campaignId.toString(),
							label: campaignName
						}))}
						defaultValue={currentCampaignId?.toString()}
						key={form.key('campaignId')}
						{...form.getInputProps('campaignId')}
					/>

					<Switch
						defaultChecked={visibility === 'PRIVATE'}
						label='Private'
						description='Private heroes can still be viewed to members of the same campaign'
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

					{heroSettings.data && !form.isTouched()
						? (
							<Text c={heroSettings.data.error ? 'red' : 'green'}>
								{heroSettings.data.message}
							</Text>
						)
						: null}
				</Stack>
			</form>
		</Stack>
	)
}

const heroSettingsSchema = type({
	heroId: 'number',
	campaignId: 'string.digits | null',
	private: 'boolean'
})

const heroSettingsAction = createServerFn({ method: 'POST' })
	.validator(heroSettingsSchema)
	.handler(async ({ data }) => {
		// TODO check if the hero is in an active tabletop

		const { supabase, user } = await requireAccount({ backlink: '/hero' })

		const { data: heroUserId, error: heroUserIdError } = await supabase
			.from('hero_info')
			.select('userId: user_id')
			.eq('hero_id', data.heroId)
			.limit(1)
			.single()
		if (heroUserIdError) return {
			error: true,
			message: heroUserIdError.message
		} satisfies FormResponse

		if (heroUserId.userId !== user.id) return {
			error: true,
			message: 'You do not own this hero'
		} satisfies FormResponse

		const serviceClient = getServiceClient()
		const { error: heroUpdateError } = await serviceClient
			.from('hero_info')
			.update({
				campaign_id: data.campaignId ? parseInt(data.campaignId) : null,
				visibility: data.private ? 'PRIVATE' : 'PUBLIC'
			})
			.eq('hero_id', data.heroId)
			.eq('user_id', user.id)
		if (heroUpdateError) return {
			error: true,
			message: heroUpdateError.message
		} satisfies FormResponse

		return {
			error: false,
			message: 'Hero settings updated'
		} satisfies FormResponse
	})
