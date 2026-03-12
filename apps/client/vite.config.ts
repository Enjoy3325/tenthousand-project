import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],

	esbuild: {
		supported: {
			'top-level-await': true,
		},
	},

	optimizeDeps: {
		esbuildOptions: {
			target: 'esnext',
			supported: {
				'top-level-await': true,
			},
		},
	},

	build: {
		target: 'esnext',
	},

	// ─── Vitest ────
	test: {
		environment: 'node',
		globals: true,
		include: ['src/**/*.test.ts'],
	},
})
