import { Box, Button, CloseButton, Divider, Group, Image, rem, Select, Stack, Switch, Text, Title } from '@mantine/core'
import { Dropzone, IMAGE_MIME_TYPE } from '@mantine/dropzone'
import { useForm } from '@mantine/form'
import { IconPhoto, IconUpload, IconX } from '@tabler/icons-react'
import { useMutation } from '@tanstack/react-query'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { type } from 'arktype'
import { getServiceClient } from '~/supabase/getServiceClient'
import { getUserId } from '~/supabase/getUserId'
import { requireAccount } from '~/supabase/requireAccount'
import { mutationError } from '~/utils/mutationError'

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
	.inputValidator(serverLoaderSchema)
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
	const { heroName } = Route.useLoaderData()

	return (
		<Stack>
			<Title>{heroName}</Title>

			<Group>
				<HeroSettings />
				<Divider orientation='vertical' />
				<HeroAvatar />
			</Group>
		</Stack>
	)
}

function HeroSettings() {
	const { currentCampaignId, campaigns, visibility } = Route.useLoaderData()
	const { heroId } = Route.useParams()

	const form = useForm({
		mode: 'uncontrolled',
		initialValues: {
			campaignId: currentCampaignId?.toString() ?? '',
			heroPrivacy: visibility === 'PRIVATE'
		}
	})

	const heroSettings = useMutation({
		mutationFn: heroSettingsAction,
		onMutate: () => {
			form.resetDirty()
			form.resetTouched()
		},
		onError: error => {
			mutationError(error, 'Failed to change hero settings')
		}
	})

	return (
		<Stack>
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
						key={form.key('heroPrivacy')}
						{...form.getInputProps('heroPrivacy', { type: 'checkbox' })}
					/>

					<Button
						type='submit'
						loading={form.submitting}
						disabled={!form.isDirty()}
					>
						Save
					</Button>

					{heroSettings.isSuccess && !form.isTouched()
						? (
							<Text c='green'>Hero settings updated</Text>
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
	heroPrivacy: 'boolean'
})

const heroSettingsAction = createServerFn({ method: 'POST' })
	.inputValidator(heroSettingsSchema)
	.handler(async ({ data: { heroId, campaignId, heroPrivacy } }) => {
		// TODO check if the hero is in an active tabletop

		const { supabase, user } = await requireAccount({ backlink: '/hero' })

		{
			const { data, error } = await supabase
				.from('hero_info')
				.select('userId: user_id')
				.eq('hero_id', heroId)
				.limit(1)
				.single()
			if (error) throw new Error(error.message, { cause: error })
			if (data.userId !== user.id) throw new Error('You do not own this hero')
		}

		const serviceClient = getServiceClient()

		{
			const { error } = await serviceClient
				.from('hero_info')
				.update({
					campaign_id: campaignId ? parseInt(campaignId) : null,
					visibility: heroPrivacy ? 'PRIVATE' : 'PUBLIC'
				})
				.eq('hero_id', heroId)
				.eq('user_id', user.id)
			if (error) throw new Error(error.message, { cause: error })
		}
	})

function HeroAvatar() {
	const { heroId } = Route.useParams()

	const form = useForm<{ avatar: File | null }>({
		mode: 'uncontrolled',
		initialValues: {
			avatar: null
		},
		validate: {
			avatar: value => value ? null : 'Avatar is required'
		}
	})

	const heroAvatar = useMutation({
		mutationFn: heroAvatarAction,
		onMutate: () => {
			form.resetDirty()
			form.resetTouched()
		},
		onError: error => {
			mutationError(error, 'Failed to change hero avatar')
		}
	})

	const handleSubmit = (values: typeof form.values) => {
		if (!values.avatar) return
		const formData = new FormData()
		formData.set('avatar', values.avatar)
		formData.set('heroId', heroId)
		heroAvatar.mutate({ data: formData })
	}

	return (
		<Stack>
			<Text>Avatar</Text>

			<form onSubmit={form.onSubmit(handleSubmit)}>
				<Stack>
					{form.values.avatar
						? (
							<Box pos='relative' w={120} h={120}>
								<Image src={URL.createObjectURL(form.values.avatar)} w={120} h={120} />
								<CloseButton onClick={() => form.setFieldValue('avatar', null)} pos='absolute' top={5} right={5} />
							</Box>
						)
						: (
							<Dropzone
								onDrop={file => form.setFieldValue('avatar', file[0] ?? null)}
								onReject={() => form.setFieldError('avatar', 'Select images only')}
								maxSize={8 * 1024 ** 2}
								accept={IMAGE_MIME_TYPE}
								multiple={false}
								maxFiles={1}
							>
								<Group justify='center' h={120 - 32} style={{ pointerEvents: 'none' }}>
									<Dropzone.Accept>
										<IconUpload size={52} color='var(--mantine-color-blue-6)' stroke={1.5} />
									</Dropzone.Accept>
									<Dropzone.Reject>
										<IconX size={52} color='var(--mantine-color-red-6)' stroke={1.5} />
									</Dropzone.Reject>
									<Dropzone.Idle>
										<IconPhoto size={52} color='var(--mantine-color-dimmed)' stroke={1.5} />
									</Dropzone.Idle>

									<Box>
										<Text size='xl' inline>
											Drag image here or click to browse files
										</Text>
										<Text size='sm' c='dimmed' inline mt={7}>
											Max file size is 8mb
										</Text>
									</Box>
								</Group>
							</Dropzone>
						)}

					<Button
						type='submit'
						loading={form.submitting}
						disabled={!form.isValid()}
					>
						Upload
					</Button>

					{heroAvatar.isSuccess && !form.isTouched()
						? (
							<Text c='green'>Hero avatar updated</Text>
						)
						: null}
				</Stack>
			</form>
		</Stack>
	)
}

const heroAvatarAction = createServerFn({ method: 'POST' })
	.inputValidator((formData: FormData) => {
		const avatar = formData.get('avatar')
		if (!avatar || !(avatar instanceof File)) {
			throw new Error('No file uploaded')
		}

		const heroId = formData.get('heroId')
		if (!heroId || isNaN(+heroId)) {
			throw new Error('Invalid hero id')
		}

		return { avatar, heroId: +heroId }
	})
	.handler(async ({ data: { avatar, heroId } }) => {
		const { supabase, user } = await requireAccount({ backlink: '/hero' })

		{
			const { data, error } = await supabase
				.from('hero_info')
				.select('userId: user_id')
				.eq('hero_id', heroId)
				.limit(1)
				.single()
			if (error) throw new Error(error.message, { cause: error })
			if (data.userId !== user.id) throw new Error('You do not own this hero')
		}

		const serviceClient = getServiceClient()

		{
			const { error } = await serviceClient
				.storage
				.from('hero_avatar')
				.upload(`${heroId}.png`, avatar, {
					upsert: true
				})
			if (error) throw new Error(error.message, { cause: error })
		}
	})
