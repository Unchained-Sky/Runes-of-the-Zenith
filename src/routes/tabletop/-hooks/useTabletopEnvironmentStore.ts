import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { createActionName, type DevTools, type Slice } from '~/types/storeTypes'

type TabletopEnvironmentState = {
	campaignId: number
	role: 'gm' | 'player'
	route: '/tabletop/$campaignId/gm/' | '/tabletop/$campaignId/player/'
}

const tabletopEnvironmentState = {
	campaignId: -1,
	role: 'player',
	route: '/tabletop/$campaignId/player/'
} satisfies TabletopEnvironmentState

type TabletopEnvironmentActions = {
	setup: (environment: TabletopEnvironmentState) => void
}

const actionName = createActionName<TabletopEnvironmentActions>('tabletopEnvironment')

const createTabletopEnvironmentActions: Slice<TabletopEnvironmentStore, TabletopEnvironmentActions, [DevTools]> = (set, get) => ({
	setup: environment => {
		if (get().campaignId !== -1) return
		set({
			campaignId: environment.campaignId,
			role: environment.role,
			route: environment.route
		}, ...actionName('setup'))
	}
})

type TabletopEnvironmentStore = TabletopEnvironmentState & TabletopEnvironmentActions

export const useTabletopEnvironmentStore = create<TabletopEnvironmentStore>()(
	devtools(
		(...a) => ({
			...tabletopEnvironmentState,
			...createTabletopEnvironmentActions(...a)
		}),
		{ name: 'Tabletop Environment Store' }
	)
)
