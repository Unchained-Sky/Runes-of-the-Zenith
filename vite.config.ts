import eslintPlugin from '@nabla/vite-plugin-eslint'
import { vitePlugin as remix } from '@remix-run/dev'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
	server: {
		port: parseInt(process.env.PORT ?? '5173')
	},
	plugins: [
		remix({
			future: {
				v3_fetcherPersist: true,
				v3_relativeSplatPath: true,
				v3_throwAbortReason: true
			}
		}),
		tsconfigPaths(),
		eslintPlugin()
	]
})
