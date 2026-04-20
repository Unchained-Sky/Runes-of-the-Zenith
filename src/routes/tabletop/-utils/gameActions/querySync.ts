import { type QueryClient } from '@tanstack/react-query'
import { type Type } from 'arktype'

type BaseProps = {
	queryClient: QueryClient
	campaignId: number
}

export type QuerySyncProps<T extends Type | undefined = undefined> = T extends Type ? BaseProps & { data: T['t'] } : BaseProps
