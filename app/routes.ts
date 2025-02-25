import { index, route, type RouteConfig } from '@remix-run/route-config'

export default [
	index('routes/index.tsx'),

	route('login', 'routes/login.tsx'),

	route('auth/error', 'routes/auth/error.tsx'),
	route('auth/callback', 'routes/auth/callback.tsx'),
	route('auth/login', 'routes/auth/login.tsx'),
	route('auth/logout', 'routes/auth/logout.tsx'),

	route('campaign', 'routes/campaign/index.tsx'),
	route('campaign/:id', 'routes/campaign/$id.tsx'),
	route('campaign/create', 'routes/campaign/create.tsx'),
	route('campaign/join/:id', 'routes/campaign/join.$id.tsx'),

	route('character', 'routes/character/index.tsx'),
	route('character/:id', 'routes/character/$id.tsx'),
	route('character/:id/settings', 'routes/character/$id.settings.tsx'),
	route('character/create', 'routes/character/create.tsx'),

	route('homebrew/map', 'routes/homebrew/map/index.tsx'),
	route('homebrew/map/:id', 'routes/homebrew/map/$id.tsx'),
	route('homebrew/map/:id/template', 'routes/homebrew/map/$id.template.tsx'),
	route('homebrew/map/create', 'routes/homebrew/map/create.tsx'),
	route('homebrew/map/:id/edit', 'routes/homebrew/map/$id.edit/index.tsx'),

	route('tabletop/:id', 'routes/tabletop/$id/index.tsx'),
	route('tabletop/:id/gm', 'routes/tabletop/$id.gm/index.tsx'),
	route('tabletop/:id/gm/change-map', 'routes/tabletop/$id.gm/action/change-map.ts'),

	route('rune-tablet', 'routes/rune-tablet/index.tsx'),
	route('talent-tree', 'routes/talent-tree/index.tsx')
] satisfies RouteConfig
