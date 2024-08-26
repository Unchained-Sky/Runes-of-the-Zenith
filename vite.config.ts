import eslintPlugin from '@nabla/vite-plugin-eslint'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
	plugins: [
		react(),
		eslintPlugin(),
		tsconfigPaths()
	]
})
