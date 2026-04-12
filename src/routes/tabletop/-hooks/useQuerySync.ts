import { getRouteApi } from '@tanstack/react-router'

export const useQuerySync = () => {
	const routeApi = getRouteApi('/tabletop/$campaignId/gm/')
	const { queryClient } = routeApi.useRouteContext()
	const { campaignId } = routeApi.useLoaderData()

	return { queryClient, campaignId }
}
