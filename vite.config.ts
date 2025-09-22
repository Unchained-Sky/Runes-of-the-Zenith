import eslintPlugin from '@nabla/vite-plugin-eslint'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import viteTsConfigPaths from 'vite-tsconfig-paths'

const config = defineConfig({
	plugins: [
		viteTsConfigPaths({
			projects: ['./tsconfig.json']
		}),
		tanstackStart({
			customViteReactPlugin: true,
			target: 'cloudflare-module'
		}),
		viteReact(),
		eslintPlugin()
	]
})

export default config
