import { defineConfig } from 'vite'

export default defineConfig({
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
		lib: {
			entry: 'src/index.ts',
			formats: ['es'],
			fileName: 'index',
		},
		rollupOptions: {
			output: {
				format: 'es',
			},
		},
	},
})
